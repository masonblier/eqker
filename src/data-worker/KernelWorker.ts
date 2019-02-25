import {DateTime,Duration} from 'luxon';
import * as DataWorker from './DataWorker';
import * as Kernels from '../kernels/index';

// luxon config
const LUXON_PRECISION = 'minutes';

// delay as to not overload the ui
const PROCESSING_DELAY = 4;
const UPDATE_BATCH_SIZE = 10;

// cache for completed interval/ticker sets
const _cache = {};

/*
  processKernelStream
    emits rows while processing interval/tickers dataset through selected kernel
*/
export async function processKernelStream({configStr}, dispatch) {
  const config = JSON.parse(configStr);
  // console.log('process kernel stream!', config)

  // get kernel fn
  const kernelFn = Kernels.table[config.kernel];
  if (!kernelFn) throw new Error('no kernel fn: '+config.kernel);


  // load reshaped data for all tickers
  const {data} = await DataWorker.loadOrCachedData(config.interval, config.tickers);

  // track ticker indexes to memoize next-row-by-date lookups
  let tickersRowsOffsetIdx = config.tickers.reduce((acc,ticker) => {
    acc[ticker] = (data.tickers[ticker].rows.length - 1);
    return acc;
  }, {} as any);

  // result newRows, newMeta, also used as in-progress values to stream to gui
  let newRows = [];
  let newMeta = {
    earliestDatetime: data.meta.earliestCommonDatetime,
    latestDatetime: data.meta.latestCommonDatetime,
    highestPrice: null,
    lowestPrice: null,
  } as any;

  // holds starting capital and assets
  const initialCash = parseFloat(config.startingCapital);
  let cash = initialCash;
  let holdings = config.tickers.reduce((acc,ticker) => { acc[ticker] = 0; return acc; }, {});

  // historical table of offset-normalized values
  let histRows = [];
  const hist = (ticker, daysBack) => {
    const histRow = histRows[daysBack || 0];
    return (histRow || {})[ticker];
  };

  // current row for buy/sell functions
  let currentRow;
  // configure buy/sell fns
  const buy = (ticker, quantity) => {
    let price = 0;
    if (config.executionMode === 'Buy/Sell Mid') {
      price = (currentRow[ticker].open + currentRow[ticker].close) / 2.0;
    } else {
      price = currentRow[ticker].high;
    }
    if (quantity * price < cash) {
      cash -= (quantity * price);
      holdings[ticker] += quantity;
      return {quantity,price}
    } else {
      return {quantity:0};
    }
  };
  const sell = (ticker, quantity) => {
    let price = 0;
    if (config.executionMode === 'Buy/Sell Mid') {
      price = (currentRow[ticker].open + currentRow[ticker].close) / 2.0;
    } else {
      price = currentRow[ticker].low;
    }
    if (holdings[ticker] > quantity) {
      holdings[ticker] -= quantity;
      cash += (quantity * price);
      return {quantity,price}
    } else {
      return {quantity:0};
    }
  };

  // start at earliest next datetime
  let frameDatetime = nextEarliestDatetime();
  let i = 0;
  while (frameDatetime && (frameDatetime <= data.meta.latestCommonDatetime)) {
    // get current aligned row values
    currentRow = config.tickers.reduce((tickerSets,ticker) => {
      const offsetIdx = tickersRowsOffsetIdx[ticker];
      const row = data.tickers[ticker].rows[Math.max(0, offsetIdx)];
      tickerSets[ticker] = row;
      return tickerSets;
    }, {} as any)


    // call kernel fn
    kernelFn({tickers:config.tickers,cash,holdings}, {hist,buy,sell});

    // calculate row from holdings * price + cash
    const newRow = config.tickers.reduce((newRow,ticker) => {
      const offsetIdx = tickersRowsOffsetIdx[ticker];
      const row = data.tickers[ticker].rows[Math.max(0, offsetIdx)];
      newRow.open = (newRows[0] || {close:initialCash}).close;
      newRow.high += holdings[ticker] * row.high;
      newRow.low += holdings[ticker] * row.low;
      newRow.close += holdings[ticker] * row.close;
      return newRow;
    }, {datetime:frameDatetime,open:cash,high:cash,low:cash,close:cash});

    // adjust meta
    if (!newMeta.highestPrice || (newRow.high > newMeta.highestPrice)) newMeta.highestPrice = newRow.high;
    if (!newMeta.lowestPrice || (newRow.low < newMeta.lowestPrice)) newMeta.lowestPrice = newRow.low;

    // add to newRows
    newRows.unshift(newRow);

    // rescale all row values
    DataWorker.appendScaledValuesForCharting(newMeta, newRows);

    // notify ui
    if (PROCESSING_DELAY) await new Promise((resolve) => setTimeout(() => resolve(), PROCESSING_DELAY));
    if (0 === (i % UPDATE_BATCH_SIZE)) {
      dispatch('KERNEL_STREAM_ROW', {configStr,meta:newMeta,rows:newRows,holdings});
    }
    frameDatetime = nextEarliestDatetime();
    i++;

    // append hist data to log
    histRows.unshift(currentRow);
  }

  // calculates next earliest datetime in set
  function nextEarliestDatetime() {
    // find earliest datetime
    let nextEarliestDatetime = null;
    for (let ticker of config.tickers) {
      if (tickersRowsOffsetIdx[ticker] < 0) continue;
      const tdt = data.tickers[ticker].rows[tickersRowsOffsetIdx[ticker]].datetime;
      if ((!nextEarliestDatetime) || (tdt < nextEarliestDatetime)) nextEarliestDatetime = tdt;
    }
    // incr row counts of matched earliest datetimes
    for (let ticker of config.tickers) {
      if (tickersRowsOffsetIdx[ticker] < 0) continue;
      if (nextEarliestDatetime === data.tickers[ticker].rows[tickersRowsOffsetIdx[ticker]].datetime) {
        tickersRowsOffsetIdx[ticker] -= 1;
      }
    }
    return nextEarliestDatetime;
  }

  dispatch('KERNEL_STREAM_DONE', {configStr,meta:newMeta,rows:newRows,holdings});
}
