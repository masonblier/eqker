import {useState,useLayoutEffect} from 'react';
import {worker} from '../../data-worker/WorkerHost';

// default useKernelStream hook state
const DEFAULT_STREAM_STATE = {
  processingDone:false, processing:false, data:null,
  lastState: {config:null}
};

// array of listeners / awaiting promises
let _waitingListeners = {};

/*
  useKernelStream
    hook for [meta,rows] state for streaming kernel result data from worker
*/
export function useKernelStream(config) {
  const [state,setState] = useState(DEFAULT_STREAM_STATE);
  const {data,processingDone,processing,lastState} = state;

  // if use props updated
  if (!(processing || processingDone) || (config !== lastState.config)) {
    // start new kernel stream worker
    setState({data:null,processingDone:false,processing:true,lastState:{config}});
    useWorkerKernelStream(config, (data) => {
      // on row update
      setState({data,processingDone:false,processing:true,lastState:{config}});
    }).then((data) => {
      // finished
      setState({data,processingDone:true,processing:true,lastState:{config}});
    });
  }

  return [data,processingDone,lastState.config];
}


/*
  useWorkerKernelStream
    wraps event-based calls of the web worker single event listener
*/
async function useWorkerKernelStream(config,listener) {
  const configStr = JSON.stringify(config);
  if (_waitingListeners[configStr]) {
    return await _waitingListeners[configStr].promise;
  } else {
    let resolveFn = (any) => {};
    const rowFn = (r) => {
      if (configStr === r.configStr) {
        listener(r);
      }
    };
    const doneFn = (r) => {
      if (configStr === r.configStr) {
        resolveFn(r);
        cleanup();
      }
    };

    const promise = new Promise((resolve) => {
      resolveFn = resolve;
      try {
        worker().on('KERNEL_STREAM_ROW', rowFn);
        worker().on('KERNEL_STREAM_DONE', doneFn);
        worker().send('KERNEL_STREAM', {configStr});
      } catch(err) {
        cleanup();
        throw err;
      }
    });
    _waitingListeners[configStr] = {promise,listener,cleanup};
    return await _waitingListeners[configStr].promise;

    function cleanup() {
      worker().off('KERNEL_STREAM_ROW', rowFn);
      worker().off('KERNEL_STREAM_DONE', doneFn);
      _waitingListeners[configStr] = null;
    }
  }
}

/*
  unsubscribeKernelStreamListeners
    unsubscribes any previous event listeners
*/
export function unsubscribeKernelStreamListeners() {
  Object.keys(_waitingListeners).forEach(wl => {
    _waitingListeners[wl] && _waitingListeners[wl].cleanup();
  });
}
