import * as DataWorker from './lib/DataWorker';

(function (self) {

function handleMessage({action,data}, dispatch) {
  switch (action) {
    case 'LOAD_DATA': return DataWorker.loadData(data, dispatch);
  }
  throw new Error('unknown worker action:'+action)
}

self.onmessage = (evt:any) => {
  handleMessage(evt.data, (action, data) => self.postMessage({action,data}));
};

self.onconnect = (evt:any) => {
  var port = evt.ports[0];
  port.onmessage = function(evt:any) {
    handleMessage(evt.data, (action, data) => port.postMessage({action,data}))
  };
};

})(self as any);
