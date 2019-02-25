import * as React from 'react';

// volume chart height / height
const VOLUME_CHART_HEIGHT = 0.1;

/*
  TickerCandlesChart
    candle chart view of ticker
*/
export function TickerCandlesChart({
  interval, meta,rows, width,height
}) {
  const candleWidth = (
    (interval==='daily' ? 60*24 :
    (interval==='15min') ? 15 :
    1
  ) * 0.8 * width / (meta.latestDatetimeInt - meta.earliestDatetimeInt));

  return (
    <div style={{width,height}}>
      <TickerCandlesChartSvg
        width={width} height={(1 - VOLUME_CHART_HEIGHT) * height}
        candleWidth={candleWidth}
        meta={meta} rows={rows}
      />
      <TickerBarChartSvg
        width={width} height={VOLUME_CHART_HEIGHT * height}
        candleWidth={candleWidth}
        meta={meta} rows={rows}
      />
    </div>
  );
}

/*
  TickerCandlesChartSvg
    svg timeseries candle chart
*/
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

/*
  TickerBarChartSvg
    svg timeseries bar chart
*/
export function TickerBarChartSvg({
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
