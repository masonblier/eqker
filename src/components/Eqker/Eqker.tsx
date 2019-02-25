import * as React from 'react';
import {TextInput,SelectInput} from '../Base/InputComponents';
const {useState,useEffect} = React;
import {TickersGrid} from './TickersGrid';

// how to simulate buy/sell request fills
const EXECUTION_MODES = ['Buy-High/Sell-Low','Buy/Sell Mid'];

// selectable kernels to simulate
const KERNEL_OPTIONS = ['buy-growing-sell-falling','buy-falling-sell-growing'];

// default ui state
const DEFAULT_STATE = {
  executionMode: 'Buy-High/Sell-Low',
  interval: '15min',
  tickers: ['SPY'],
  startingCapital: 10000,
  kernels: ['buy-one-sell-one']
};

/*
  useEqkerState
    state wrapper/reducer for ui actions
*/
export function useEqkerState() {
  const [state, setState] = useState(DEFAULT_STATE);
  const dispatch = (action, data) => (
    // config - merges data props onto state for changing config
    (action === 'config') ? setState({...state, ...data}) :

    // setAdd - adds value to unique set state[key]
    (action === 'setAdd') ? setState({...state,
      [data.key]: (
        (state[data.key].indexOf(data.value) === -1) ?
          state[data.key].concat([data.value])
        : state[data.key]
      )}) :

    // setRemove - remove value from set
    (action === 'setRemove') ? setState({...state,
      [data.key]: state[data.key].filter(t => t !== data.value)}) :

    // no match
    console.error('unknown action', action, data)
  );
  return [state as any, dispatch];
}

/*
  EqkerUi
    root ui element
*/
export function EqkerUi() {
  const [state,dispatch] = useEqkerState();
  return (
    <div className='eqker-ui container mx-auto'>
      <EqkerHeader />
      <TickersGrid state={state} dispatch={dispatch}/>
      <EqkerRunForm state={state} dispatch={dispatch}/>
    </div>
  );
}

/*
  EqkerHeader
*/
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

/*
  EqkerRunForm
    ui to configure and start/stop simulation
*/
export function EqkerRunForm({
  state: {startingCapital, kernel, executionMode}, dispatch
}) {
  return (
    <div className='bg-primary shadow-md rounded-md p-4 my-4'>
      <div className='font-bold text-xl mb-2'>Run</div>
      <form className='max-w-xs'>
        <div className='flex flex-row my-1'>
          <span className='flex-none w-24'>Initial Capital</span>
          <TextInput className='mx-1 flex-none w-24 text-right'
            value={startingCapital}
            onChange={(startingCapital) => dispatch('config', {startingCapital})}/>
        </div>
        <div className='flex flex-row my-1'>
          <span className='flex-none w-24'>Execution</span>
          <SelectInput className='mx-1 flex-grow' options={EXECUTION_MODES}
            value={executionMode}
            onChange={(executionMode) => dispatch('config', {executionMode})}/>
        </div>
        <div className='flex flex-row my-1'>
          <span className='flex-none w-24'>Add Kernel</span>
          <SelectInput className='mx-1 flex-grow' options={KERNEL_OPTIONS}
            onChange={(kernel) => dispatch('setAdd', {key:'kernels',value:kernel})}
            value={''}/>
        </div>
      </form>
      {/*<div className='pull-right'>
        <button className='dark-button'>Start</button>
      </div>*/}
    </div>
  );
}
