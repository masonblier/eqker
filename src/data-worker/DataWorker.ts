import {DateTime,Duration} from 'luxon';

// luxon config
const LUXON_PRECISION = 'minutes';

// cache for completed interval/ticker sets
const _cache = {};

/*
  loadData
    loads a set of tickers for an interval
*/
export async function loadData({interval,tickers}, dispatch) {
  // load data
  const dataSets = await Promise.all(
    tickers.map((ticker) => loadTickerData(interval,ticker)));

  // reshape/scale data based on min/max datetimes of entire set
  const data = await reshapeData(tickers, dataSets);

  // return
  dispatch('LOADED_DATA', {interval,tickers,data});
}

/*
  loadTickerData
    loads a ticker csv and calculates min/max bounds
*/
async function loadTickerData(interval,ticker) {
  const fileName = `${ticker}_${interval}.csv`;
  if (_cache[fileName]) return _cache[fileName];

  // fetch data text
  const csvText = await fetch(`data/${fileName}`).then(r => r.text());
  const csvLines = csvText.split(/\r?\n/gm);

  // retain found min/max values
  let earliestDatetime = null;
  let latestDatetime = null;
  let lowestPrice = null;
  let highestPrice = null;
  let lowestVolume = null;
  let highestVolume = null;

  // parsed each row
  const rows = csvLines.slice(1).map((line) => {
    // parse values
    const parts = line.split(',');
    const datetime = parts[0];
    const open = parseFloat(parts[1]);
    const high = parseFloat(parts[2]);
    const low = parseFloat(parts[3]);
    const close = parseFloat(parts[4]);
    const volume = parseInt(parts[4], 10);

    // check for min/max values
    if (!earliestDatetime || (datetime < earliestDatetime)) earliestDatetime = datetime;
    if (!latestDatetime || (datetime > latestDatetime)) latestDatetime = datetime;
    if (!highestPrice || (high > highestPrice)) highestPrice = high;
    if (!lowestPrice || (low < lowestPrice)) lowestPrice = low;
    if (!highestVolume || (volume > highestVolume)) highestVolume = volume;
    if (!lowestVolume || (volume < lowestVolume)) lowestVolume = volume;

    return {datetime, open, high, low, close, volume};
  });

  // collect meta data
  const meta = {
    rowCount:(csvLines.length - 1),
    earliestDatetime,
    latestDatetime,
    lowestPrice,
    highestPrice,
    lowestVolume,
    highestVolume,
  };

  // save cache and return
  return _cache[fileName] = {meta,rows};
}


/*
  reshapeData
    reformats each data set to common earliest/latest datetime
*/
async function reshapeData(tickers, dataSets) {
  // find earliest/latest common datetime from each ticker's meta info
  let earliestCommonDatetime = null;
  let latestCommonDatetime = null;
  tickers.forEach((ticker,tickerIdx) => {
    const {meta} = dataSets[tickerIdx];
    if ((!earliestCommonDatetime) || (meta.earliestDatetime > earliestCommonDatetime)) {
      earliestCommonDatetime = meta.earliestDatetime;
    }
    if ((!latestCommonDatetime) || (meta.latestDatetime < latestCommonDatetime)) {
      latestCommonDatetime = meta.latestDatetime;
    }
  });

  // trim rows to common datetime range bounds
  const newTickersTable =  tickers.reduce((newTickersTable, ticker,tickerIdx) => {
    const {meta,rows} = dataSets[tickerIdx];
    let newMeta = {} as any;
    let earliestValidIdx = null, latestValidIdx = null;

    // find datetime range start/end indexes, and also new min/max values
    rows.forEach(({datetime, open, high, low, close, volume},idx) => {
      if ((datetime >= earliestCommonDatetime) &&
          (datetime <= latestCommonDatetime)
      ) {
        // first valid datetime idx
        if (earliestValidIdx === null) earliestValidIdx = idx;

        // ranged min/max values
        if (!newMeta.highestPrice || (high > newMeta.highestPrice)) newMeta.highestPrice = high;
        if (!newMeta.lowestPrice || (low < newMeta.lowestPrice)) newMeta.lowestPrice = low;
        if (!newMeta.highestVolume || (volume > newMeta.highestVolume)) newMeta.highestVolume = volume;
        if (!newMeta.lowestVolume || (volume < newMeta.lowestVolume)) newMeta.lowestVolume = volume;

      } else {
        if ((earliestValidIdx !== null) && (latestValidIdx === null)) {
          // datetimes beyond this are invalid
          latestValidIdx = idx;
        }
      }
    });

    // validate validIdxs
    if (earliestValidIdx === null) throw new Error('reshapeData datetime range failed: '+ticker);
    if (latestValidIdx === null) latestValidIdx = (rows.length - earliestValidIdx);

    // slice rows to datetime range
    const newRows = (rows as any[]).slice(earliestValidIdx, latestValidIdx);

    // new meta
    newMeta.earliestDatetime = newRows[newRows.length-1].datetime;
    newMeta.latestDatetime = newRows[0].datetime;

    // calculate int representations of date space
    const latestDatetimeIso = DateTime.fromISO(newMeta.latestDatetime.split(' ').join('T'));
    newMeta.earliestDatetimeInt = getDatetimeInt(newMeta.earliestDatetime, latestDatetimeIso);
    newMeta.latestDatetimeInt = 0;


    // values scaled to 0.0-1.0 bounds of min/max data to precalculate for rendering
    const newRowsWithScaledValues = newRows.map((r:any) => {
      const datetimeInt = getDatetimeInt(r.datetime, latestDatetimeIso);
      const datetimeDiv = ((newMeta.latestDatetimeInt - newMeta.earliestDatetimeInt) || 1);
      const priceDiv = ((newMeta.highestPrice - newMeta.lowestPrice) || 1);
      const volumeDiv = ((newMeta.highestVolume - newMeta.lowestVolume) || 1);
      r.datetimeScaled = (datetimeInt - newMeta.earliestDatetimeInt) / datetimeDiv;
      r.openScaled = (newMeta.highestPrice - r.open) / priceDiv;
      r.closeScaled = (newMeta.highestPrice - r.close) / priceDiv;
      r.highScaled = (newMeta.highestPrice - r.high) / priceDiv;
      r.lowScaled = (newMeta.highestPrice - r.low) / priceDiv;
      r.volumeScaled = (newMeta.highestVolume - r.volume) / volumeDiv;
      return r;
    });

    newTickersTable[ticker] = {
      rows: newRowsWithScaledValues,
      meta: newMeta,
    };
    return newTickersTable;
  }, {} as any);

  return {tickers:newTickersTable,meta:{earliestCommonDatetime,latestCommonDatetime}};
}


/*
  getDatetimeInt
    gets difference from latestDatetime in LUXON_PRECISION units (minutes)
*/
function getDatetimeInt(datetime, latestDatetimeIso) {
  return DateTime.fromISO(datetime.split(' ').join('T'))
      .diff(latestDatetimeIso, LUXON_PRECISION).as(LUXON_PRECISION);
}
