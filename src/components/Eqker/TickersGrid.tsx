import * as React from 'react';
const {useState} = React;
import {SelectInput} from '../Base/InputComponents';
import {useResizeEffect} from '../Base/UseResizeEffect';
import {LoadingSpinner} from '../Base/LoadingSpinner';
import {useTickersData} from './useTickersData';
import {TickerCandlesChart} from './TickerCharts';

// time scales in data set
const TIME_SCALES = ['1min','15min','daily'];

// tickers in sample data set
const TICKERS = [
 'AAPL','AMT','AMZN','BAC','BK','DFS','GLD','JPM','MSFT','MU','PPLT','QQQ',
 'SBUX','SLV','SPY','TRV','TSLA','TZA','UGA','V','VIX','VOO','VXXB','XLP'
];

// ratio of chart width / height
const CHART_ASPECT_RATIO = 16 / 9;

/*
  TickersGrid
    shows selected tickers in grid of charts form
*/
export function TickersGrid({
  state: {interval, tickers}, dispatch
}) {
  const [data,loaded,loadedInterval,loadedTickers]
    = useTickersData({interval,tickers}) as any[];
  return (
    <div className='-mx-2 my-4'>
      <div>
        <TickersGridIntervalForm state={{interval}} dispatch={dispatch}/>
        <TickersGridAddForm dispatch={dispatch}/>
        {data ?
          <div className='inline-block max-w-xs my-2 mx-6 text-sm'>
            <span>{data.meta.earliestCommonDatetime}</span>
            <span> to </span>
            <span>{data.meta.latestCommonDatetime}</span>
          </div>
        : null}
      </div>
      <div className='flex flex-row flex-wrap flex-grid'>
        {loadedTickers.map((ticker,idx) => (
          <div className='flex-grid-w-md' key={ticker}>
            <div className='bg-secondary shadow-md rounded-md m-2 p-4 relative'>
              <a className='close-x' onClick={() => dispatch('setRemove', {key:'tickers',value:ticker})}>x</a>
              <div>{ticker}</div>
              <TickersGridChartGroup
                interval={loadedInterval} ticker={ticker} loaded={loaded}
                meta={data && data.tickers[ticker].meta} rows={data && data.tickers[ticker].rows}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/*
  TickersGridChartGroup
    horizontal display with chart and metadata
*/
export function TickersGridChartGroup({
  interval, ticker, loaded, rows,meta
}) {
  const [{width},setOuterSize] = useState({width:0});
  const height =  width / CHART_ASPECT_RATIO;
  const [outerRef] = useResizeEffect((newSize) => {
    if (width !== newSize.width) {
      setOuterSize({width: newSize.width});
    }
  });
  return (
    <div>
      {(loaded) ?
        <div className='flex flex-row'>
          <div className='flex-none text-xs'>
            <div className='flex flex-row'><span className='mr-1'>First</span>
              <span className='flex-grow text-right'>{rows[rows.length-1].open.toFixed(2)}</span></div>
            <div className='flex flex-row'><span>Last</span>
              <span className='flex-grow text-right'>{rows[0].close.toFixed(2)}</span></div>
            <div className='flex flex-row'><span>High</span>
              <span className='flex-grow text-right'>{meta.highestPrice.toFixed(2)}</span></div>
            <div className='flex flex-row'><span>Low</span>
              <span className='flex-grow text-right'>{meta.lowestPrice.toFixed(2)}</span></div>
          </div>
          <div className='flex-grow flex-shrink overflow-hidden' ref={outerRef}>
            {(width > 0) ?
              <TickerCandlesChart interval={interval}
                meta={meta} rows={rows} width={width} height={height}
              />
            : null}
          </div>
        </div>
      :
        <LoadingSpinner width='100%' height={100}/>
      }
    </div>
  );
}

/*
  TickersGridIntervalForm
    wraps dropdown to select additional tickers
*/
export function TickersGridIntervalForm({
  state: {interval}, dispatch
}) {
  return (
    <form className='inline-block max-w-xs my-2 mx-6'>
      <div className='flex flex-row my-1'>
        <span className='flex-none w-24'>Time Scale</span>
        <SelectInput className='mx-1 flex-grow' options={TIME_SCALES}
          value={interval}
          onChange={(interval) => dispatch('config', {interval})}/>
      </div>
    </form>
  );
}

/*
  TickersGridAddForm
    wraps dropdown to select additional tickers
*/
export function TickersGridAddForm({
  dispatch
}) {
  return (
    <form className='inline-block max-w-xs my-2 mx-6'>
      <div className='flex flex-row my-1'>
        <span className='flex-none w-24'>Add Equity</span>
        <SelectInput className='mx-1 flex-grow' options={TICKERS} value={''}
          onChange={(ticker) => dispatch('setAdd', {key:'tickers',value:ticker})}/>
      </div>
    </form>
  );
}
