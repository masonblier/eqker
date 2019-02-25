import * as React from 'react';
const {useState,useEffect} = React;
import {useResizeEffect} from '../Base/UseResizeEffect';
import {useKernelStream,unsubscribeKernelStreamListeners} from './useKernelStream';
import {TimeSeriesCandlesChart,TimeSeriesInfo} from './TimeSeriesCharts';

// ratio of chart width / height
const CHART_ASPECT_RATIO = 4;

/*
  KernelsGrid
    show result of kernel simulations as timeseries grid
*/
export function KernelsGrid({
  state: {interval, tickers, executionMode, startingCapital, kernels, started, paused}, dispatch
}) {
  return (
    <div className='-mx-2 my-4'>
      <div className='flex flex-row flex-wrap flex-grid'>
        {kernels.map((kernel,idx) => (
          <div className='flex-grid-w-md' key={kernel}>
            <div className='bg-secondary shadow-md rounded-md m-2 p-4 relative'>
              {started ? null : <a className='close-x' onClick={() => dispatch('setRemove', {key:'kernels',value:kernel})}>x</a>}
              <div className='mb-1'>{kernel}</div>
              {started ?
                <KernelsGridChartStreamUnsubscriber
                  config={{interval,tickers,executionMode,startingCapital,kernel}}
                  paused={paused}
                />
              : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


/*
  KernelsGridChartStreamUnsubscriber
    wrapper to handle unsubscribing from kernel stream
*/
export function KernelsGridChartStreamUnsubscriber({
  config, paused
}) {
  // unsubscribe on ui unmount
  useEffect(() => {
    return function cleanup() {
      unsubscribeKernelStreamListeners();
    };
  });
  return (<KernelsGridChartStream config={config} paused={paused}/>);
}

/*
  KernelsGridChartStream
    stream data wrapper for result kernel sim data
*/
export function KernelsGridChartStream({
  config, paused
}) {
  const [data,isDone,loadedConfig] = useKernelStream(config);
  return (<div>{data ?
    <KernelsGridChartGroup
      data={data}
      config={config}
    />
  : null}</div>);
}


/*
  KernelsGridChartGroup
    horizontal display with chart and metadata
*/
export function KernelsGridChartGroup({
  config, data
}) {
  const [{width},setOuterSize] = useState({width:0});
  const height =  width / CHART_ASPECT_RATIO;
  const [outerRef] = useResizeEffect((newSize) => {
    if (width !== newSize.width) {
      setOuterSize({width: newSize.width});
    }
  });
  return (
    <div className='flex flex-col'>
      <div className='flex-grow flex-shrink overflow-hidden' ref={outerRef}>
        {((width > 0)) ?
          <TimeSeriesCandlesChart interval={config.interval}
            meta={data.meta} rows={data.rows} width={width} height={height}
          />
        : null}
      </div>
      <TimeSeriesInfo meta={data.meta} rows={data.rows}/>
      {data.holdings ?
        <div className='my-2 text-xs text-default-soft'>
          {Object.keys(data.holdings).map((ticker) => (
            <span key={ticker}>{ticker}x{data.holdings[ticker]} </span>
          ))}
        </div>
      : null}
    </div>
  );
}
