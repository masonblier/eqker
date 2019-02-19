import * as React from 'react';
import {SelectInput} from '../Base/InputComponents';
const {useState,useEffect} = React;
import {TickerCandlesChart} from './TickerCharts';

const TICKERS = [
 'AAPL','AMT','AMZN','BAC','BK','DFS','GLD','JPM','MSFT','MU','PPLT','QQQ',
 'SBUX','SLV','SPY','TRV','TSLA','TZA','UGA','V','VIX','VOO','VXXB','XLP'
];
const TIME_SCALES = ['1min','15min','daily'];
const EXECUTION_MODES = ['Buy-High/Sell-Low','Buy/Sell Mid'];

const DEFAULT_STATE = {
  interval: '15min',
  executionMode: 'Buy-High/Sell-Low',
  tickers: ['SPY']
};

export function useEqkerState() {
  const [state, setState] = useState(DEFAULT_STATE);
  const dispatch = (action, data) => (
    (action === 'config') ? setState({...state, ...data}) :
    (action === 'addTicker') ? setState({...state,
      tickers: (
        (state.tickers.indexOf(data) === -1) ?
          state.tickers.concat([data])
        : state.tickers
      )}) :
    (action === 'removeTicker') ? setState({...state,
      tickers: state.tickers.filter(t => t !== data)}) :
    console.error('unknown action', action, data)
  );
  return [state as any, dispatch];
}

export function EqkerUi() {
  const [state,dispatch] = useEqkerState();
  return (
    <div className='eqker-ui container mx-auto'>
      <EqkerHeader />
      <EqkerConfigForm
        state={state}
        dispatch={dispatch}
      />
      <EquitiesList
        state={state}
        dispatch={dispatch}
      />
    </div>
  );
}

export function EqkerHeader() {
  return (
    <div className='header m-4'>
      <h1>
        <span className='text-primary'>eq</span>
        <span className='text-secondary'>ker</span>
      </h1>
    </div>
  );
}

export function EqkerConfigForm({
  state: {interval, executionMode}, dispatch
}) {
  return (
    <div className='bg-primary shadow-md rounded-md p-4 my-4'>
      <div className='font-bold text-xl mb-2'>Eqker Config</div>
      <form className='max-w-xs'>
        <div className='flex flex-row my-1'>
          <span className='flex-none w-24'>Time Scale</span>
          <SelectInput className='mx-1 flex-grow' options={TIME_SCALES}
            value={interval}
            onChange={(interval) => dispatch('config', {interval})}/>
        </div>
        {/*<div className='flex flex-row my-1'>
          <span className='flex-none w-24'>Execution</span>
          <SelectInput className='mx-1 flex-grow' options={EXECUTION_MODES}
            value={executionMode}
            onChange={(executionMode) => dispatch('config', {executionMode})}/>
        </div>*/}
      </form>
    </div>
  );
}

export function EquitiesList({
  state: {interval, tickers}, dispatch
}) {
  return (
    <div className='-mx-2 my-4'>
      <EquitiesListAddForm dispatch={dispatch}/>
      <div className='flex flex-row flex-wrap flex-grid'>
        {tickers.map((ticker,idx) => (
          <div className='flex-grid-w-md' key={ticker}>
            <div className='bg-secondary shadow-md rounded-md m-2 p-4 relative'>
              <div>{ticker}</div>
              <a className='close-x' onClick={() => dispatch('removeTicker', ticker)}>x</a>
              <TickerCandlesChart interval={interval} ticker={ticker} dispatch={dispatch}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EquitiesListAddForm({
  dispatch
}) {
  return (
    <form className='max-w-xs my-2 mx-6'>
      <div className='flex flex-row my-1'>
        <span className='flex-none w-24'>Add Equity</span>
        <SelectInput className='mx-1 flex-grow' options={TICKERS}
          value={''}
          onChange={(ticker) => dispatch('addTicker', ticker)}/>
      </div>
    </form>
  );
}
