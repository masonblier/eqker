import * as React from 'react';
import {SelectInput} from '../Base/InputComponents';
const {useState} = React;
import {useResizeEffect} from '../Base/UseResizeEffect';
import {useData} from './UseData';

const CHART_ASPECT_RATIO = 16 / 9;
const VOLUME_CHART_HEIGHT = 0.1;

export function TickerCandlesChart({
  interval, ticker, dispatch
}) {
  const [{width},setOuterSize] = useState({width:0});
  const height =  width / CHART_ASPECT_RATIO;
  const [outerRef] = useResizeEffect((newSize) => {
    if (width !== newSize.width) {
      setOuterSize({width: newSize.width});
    }
  });

  return (
    <div className='tickers-candles-chart-wrapper' ref={outerRef}>
      <TickerCandlesChartLoader
        width={width} height={height}
        ticker={ticker} interval={interval}
      />
    </div>
  );
}

export function TickerCandlesChartLoader({
  width,height, ticker,interval
}) {
  const [meta,rows,loaded] = useData({ticker,interval}) as any[];

  if (!(loaded && (width > 0))) {
    return <TickersCandlesChartLoading width={width} height={height}/>;
  }

  const candleWidth = (interval==='daily' ? 60*24 : (interval==='15min') ? 15 : 1)
    * width / (meta.latestDatetimeInt - meta.earliestDatetimeInt) * 0.8;

  return (
    <div style={{width,height}}>
      <TickerCandlesChartSvg
        width={width} height={(1 - VOLUME_CHART_HEIGHT) * height}
        candleWidth={candleWidth}
        meta={meta} rows={rows}
      />
      <TickerVolumeChartSvg
        width={width} height={VOLUME_CHART_HEIGHT * height}
        candleWidth={candleWidth}
        meta={meta} rows={rows}
      />
    </div>
  );
}

export function TickerCandlesChartSvg({
  width,height, candleWidth, meta,rows
}) {
  return (
    <svg style={{width,height}} viewBox={`0 0 ${width} ${height}`}>
      {rows.map(({open,close,datetimeScaled,openScaled,closeScaled,
        highScaled,lowScaled,volumeScaled,strokeColor
      },idx) => (
        <g key={idx}>
          <rect
            fill={(open < close) ? '#00cc0080' : '#cc000080'}
            x={(width - candleWidth) * datetimeScaled}
            width={candleWidth}
            y={height * Math.min(openScaled, closeScaled)}
            height={height * Math.abs(openScaled - closeScaled)}
          />
          <line
            stroke={(open < close) ? '#00cc00' : '#cc0000'} strokeWidth={1}
            x1={(width - candleWidth) * datetimeScaled + candleWidth / 2}
            x2={(width - candleWidth) * datetimeScaled + candleWidth / 2}
            y1={height * highScaled}
            y2={height * lowScaled}
          />
        </g>
      ))}
    </svg>
  )
}

export function TickerVolumeChartSvg({
  width,height, candleWidth, meta,rows
}) {
  return (
    <svg style={{width,height}} viewBox={`0 0 ${width} ${height}`}>
      {rows.map(({open,close,datetimeScaled,openScaled,closeScaled,
        highScaled,lowScaled,volumeScaled,strokeColor
      },idx) => (
        <g key={idx}>
          <rect
            fill='#77777780' stroke='#77777780' strokeWidth={1}
            x={(width - candleWidth) * datetimeScaled}
            width={candleWidth}
            y={height - (height * volumeScaled)}
            height={height * volumeScaled}
          />
        </g>
      ))}
    </svg>
  )
}

function TickersCandlesChartLoading({width,height}) {
  return (
    <div className='flex items-center justify-center' style={{width,height}}>
      <svg
       width="40px" height="40px" viewBox="0 0 40 40" style={{marginTop:'-21px'}}>
        <path opacity="0.2" fill="#000" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946
          s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634
          c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"/>
        <path fill="#000" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0
          C22.32,8.481,24.301,9.057,26.013,10.047z">
        <animateTransform attributeType="xml"
          attributeName="transform"
          type="rotate"
          from="0 20 20"
          to="360 20 20"
          dur="0.5s"
          repeatCount="indefinite"/>
        </path>
      </svg>
    </div>
  );
}
