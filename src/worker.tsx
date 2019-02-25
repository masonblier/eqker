import * as DataWorker from './data-worker/DataWorker';

/*
  initWorker
    iife to wrap worker `self` instance
*/
function initWorker(self) {

  /*
    handleMessage
      routes messages to handlers by action type
  */
  function handleMessage({action,data}, dispatch) {
    switch (action) {
      case 'LOAD_DATA': return DataWorker.loadData(data, dispatch);
    }
    throw new Error('unknown worker action:'+action)
  }

  // handles Worker message from parent window WorkerHost instance
  self.onmessage = (evt:any) => {
    handleMessage(evt.data, (action, data) => self.postMessage({action,data}));
  };

  // handles SharedWorker connections from parent window WorkerHost instance
  self.onconnect = (evt:any) => {
    var port = evt.ports[0];
    // handles message from SharedWorker
    port.onmessage = function(evt:any) {
      handleMessage(evt.data, (action, data) => port.postMessage({action,data}))
    };
  };

}

// immediately invoked
initWorker(self as any);
