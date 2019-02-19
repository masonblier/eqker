import {DateTime,Duration} from 'luxon';

const LUXON_PRECISION = 'minutes';

const _cache = {};

export async function loadData({fileName}, dispatch) {
  // console.log('loading data', fileName)
  if (_cache[fileName]) return _cache[fileName];

  // fetch data text
  const csvText = await fetch('data/'+fileName).then(r => r.text());
  const csvLines = csvText.split(/\r?\n/gm);

  // retain found min/max values
  let earliestDatetime = null;
  let latestDatetime = null;
  let lowestPrice = null;
  let highestPrice = null;
  let lowestVolume = null;
  let highestVolume = null;

  // parsed row values
  const rawRows = csvLines.slice(1).map((line) => {
    const parts = line.split(',');
    const datetime = parts[0];
    const open = parseFloat(parts[1]);
    const high = parseFloat(parts[2]);
    const low = parseFloat(parts[3]);
    const close = parseFloat(parts[4]);
    const volume = parseInt(parts[4], 10);

    if (!earliestDatetime || (datetime < earliestDatetime)) {
      earliestDatetime = datetime;
    }
    if (!latestDatetime || (datetime > latestDatetime)) {
      latestDatetime = datetime;
    }
    if (!highestPrice || (high > highestPrice)) highestPrice = high;
    if (!lowestPrice || (low < lowestPrice)) lowestPrice = low;

    if (!highestVolume || (volume > highestVolume)) highestVolume = volume;
    if (!lowestVolume || (volume < lowestVolume)) lowestVolume = volume;

    return {datetime, open, high, low, close, volume};
  });

  const latestDatetimeIso = DateTime.fromISO(latestDatetime.split(' ').join('T'));
  const earliestDatetimeInt = getDatetimeInt(earliestDatetime, latestDatetimeIso);
  const latestDatetimeInt = 0;

  const meta = {
    rowCount:(csvLines.length - 1),
    earliestDatetime,
    latestDatetime,
    earliestDatetimeInt,
    latestDatetimeInt,
    lowestPrice,
    highestPrice,
    lowestVolume,
    highestVolume,
  };

  // chart scaled values calculated from meta
  const rows = rawRows.map((r:any) => {
    const datetimeInt = getDatetimeInt(r.datetime, latestDatetimeIso);
    const datetimeDiv = ((meta.latestDatetimeInt - meta.earliestDatetimeInt) || 1);
    const priceDiv = ((meta.highestPrice - meta.lowestPrice) || 1);
    const volumeDiv = ((meta.highestVolume - meta.lowestVolume) || 1);
    r.datetimeScaled = (datetimeInt - meta.earliestDatetimeInt) / datetimeDiv;
    r.openScaled = (meta.highestPrice - r.open) / priceDiv;
    r.closeScaled = (meta.highestPrice - r.close) / priceDiv;
    r.highScaled = (meta.highestPrice - r.high) / priceDiv;
    r.lowScaled = (meta.highestPrice - r.low) / priceDiv;
    r.volumeScaled = (meta.highestVolume - r.volume) / volumeDiv;
    return r;
  });

  _cache[fileName] = {fileName,meta,rows};
  dispatch('LOADED_DATA', {fileName,meta,rows})
}

// get scaled int value for datetimes in this series
function getDatetimeInt(datetime, latestDatetimeIso) {
  return DateTime.fromISO(datetime.split(' ').join('T'))
      .diff(latestDatetimeIso, LUXON_PRECISION).as(LUXON_PRECISION);
}