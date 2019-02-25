import * as React from 'react';

// volume chart height / height
const VOLUME_CHART_HEIGHT = 0.3;

/*
  TimeSeriesCandlesChart
    stock/ticker candle chart view
*/
export function TimeSeriesCandlesChart({
  interval, meta,rows, width,height
}) {
  const candleWidth = (
    (interval==='daily' ? 60*24 :
    (interval==='15min') ? 15 :
    1
  ) * 0.8 * width / (meta.latestDatetimeInt - meta.earliestDatetimeInt));

  return (
    <div style={{width,height}}>
      <TimeSeriesCandlesChartSvg
        width={width} height={(1 - VOLUME_CHART_HEIGHT) * height}
        candleWidth={candleWidth}
        meta={meta} rows={rows}
      />
      {(meta.highestVolume > 0) ?
        <TimeSeriesBarChartSvg
          width={width} height={VOLUME_CHART_HEIGHT * height}
          candleWidth={candleWidth}
          meta={meta} rows={rows}
        />
      : null}
    </div>
  );
}

/*
  TimeSeriesCandlesChartSvg
    svg timeseries candle chart
*/
export function TimeSeriesCandlesChartSvg({
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

/*
  TimeSeriesBarChartSvg
    svg timeseries bar chart
*/
export function TimeSeriesBarChartSvg({
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

export function TimeSeriesInfo({meta,rows}) {
  return (
    <div className='flex-none text-xs mt-2'>
      <div className='flex flex-row'>
        <span className='mr-1 text-default-soft'>First</span>
        <span>{rows[rows.length-1].open.toFixed(2)}</span>
        <span className='flex-grow'></span>
        <span className='mr-1 text-default-soft'>Last</span>
        <span>{rows[0].close.toFixed(2)}</span>
      </div>
      <div className='flex flex-row'>
        <span className='mr-1 text-default-soft'>High</span>
        <span>{meta.highestPrice.toFixed(2)}</span>
        <span className='flex-grow'></span>
        <span className='mr-1 text-default-soft'>Low</span>
        <span>{meta.lowestPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}
