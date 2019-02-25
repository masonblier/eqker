import {useState} from 'react';
import {worker} from '../../data-worker/WorkerHost';

// default useTickersData hook state
const DEFAULT_DATA_STATE = {
  loaded:false, loading:false, data:null,
  lastState: {interval:null, tickers:[]}
};

// holds promises of awaiting queries to worker
let _waitingResolves = {};

/*
  useTickersData
    hook for [meta,rows,loaded] state while loading data from worker
*/
export function useTickersData({interval,tickers}) {
  const [state,setState] = useState(DEFAULT_DATA_STATE);
  const {data,loaded,loading,lastState} = state;

  if (!(loading || loaded) || (tickers !== lastState.tickers) || (interval !== lastState.interval)) {
    setState({data:null,loaded:false,loading:true,lastState:{interval,tickers}});
    useWorkerTickersData(interval,tickers).then(({data}) => {
      setState({data,loaded:true,loading:false,lastState:{interval,tickers}});
    });
  }
  return [data,loaded,lastState.interval,lastState.tickers];
}

/*
  useWorkerTickersData
    wraps event-based calls of the web worker into cached promises
*/
async function useWorkerTickersData(interval,tickers) {
  const wStr = `${interval}:${tickers.join(',')}`;
  if (_waitingResolves[wStr]) {
    return await _waitingResolves[wStr];
  } else {
    _waitingResolves[wStr] = new Promise((resolve) => {
      const listener = (r) => {
        const rWStr = `${r.interval}:${r.tickers.join(',')}`;
        if (wStr === rWStr) {
          resolve(r);
          cleanup();
        }
      };
      try {
        worker().on('LOADED_DATA', listener);
        worker().send('LOAD_DATA', {interval,tickers});
      } catch(err) {
        cleanup();
        throw err;
      }
      function cleanup() {
        worker().off('LOADED_DATA', listener);
        _waitingResolves[wStr] = null;
      }
    });
    return await _waitingResolves[wStr];
  }
}
