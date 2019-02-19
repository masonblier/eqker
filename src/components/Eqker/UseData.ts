import {useState} from 'react';
import {worker} from '../../lib/WorkerHost';

const DEFAULT_DATA_STATE = {loaded:false,loading:false,meta:{},rows:[],lastFileName:null};
const _cachedData = {};

export function useData({ticker,interval}) {
  const fileName = `${ticker}_${interval}.csv`;

  const [state,setState] = useState(DEFAULT_DATA_STATE);
  const {meta,rows,loaded,loading,lastFileName} = state;

  if ((fileName !== lastFileName) || !(loading||loaded)) {
    if (_cachedData[fileName]) {
      setState({..._cachedData[fileName],loaded:true,loading:false,lastFileName:fileName});
    } else {
      setState({meta:{},rows:[],loaded:false,loading:true,lastFileName:fileName});
      loadDataFromWorker(fileName).then(({meta,rows}) => {
        setState({meta,rows,loaded:true,loading:false,lastFileName:fileName});
      });
    }
  }
  return [meta,rows,loaded];
}

let _waitingResolves = {};

async function loadDataFromWorker(fileName) {
  if (!_cachedData[fileName]) {
    const wRslvs = _waitingResolves[fileName];
    if (wRslvs && wRslvs.length > 0) {
      _cachedData[fileName] = await new Promise((resolve) => {
        if (!wRslvs) _waitingResolves[fileName] = [];
        _waitingResolves[fileName].push(resolve);
      });
    } else {
      _cachedData[fileName] = await new Promise((resolve) => {
        if (!wRslvs) _waitingResolves[fileName] = [];
        _waitingResolves[fileName].push(resolve);

        const listener = (r) => {
          if (fileName === r.fileName) {
            _waitingResolves[fileName].forEach(resolve => resolve(r));
            cleanup();
          }
        };
        try {
          worker().on('LOADED_DATA', listener);
          worker().send('LOAD_DATA', {fileName});
        } catch(err) {
          cleanup();
          throw err;
        }
        function cleanup() {
          worker().off('LOADED_DATA', listener);
          _waitingResolves[fileName] = [];
        }
      });
    }
  }

  return _cachedData[fileName];
};
