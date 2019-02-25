// worker script url
const WORKER_SCRIPT = 'worker.bundle.js';

// option to use SharedWorker if available
const USE_SHARED_WORKER = false;

// holds worker singleton instance
let _instance;

/*
  worker
    creates/returns WorkerHost singleton
*/
export function worker() {
  if (!_instance) {
    _instance = new WorkerHost(WORKER_SCRIPT);
  }
  return _instance;
}

/*
  WorkerHost
    wrapper for Worker or SharedWorker message port
*/
export class WorkerHost {
  // wrapped message port
  wop: MessagePort;

  // map of event names to listener arrays
  listeners: any = {};

  constructor(private src: string) {
    this.startWorker();
  }

  /*
    startWorker
      initializes and starts worker
  */
  startWorker() {
    const SharedWorker = USE_SHARED_WORKER && (window as any).SharedWorker;
    const worker = new (SharedWorker || Worker)(this.src);
    this.wop = ((worker as any).port || worker);

    this.wop.onmessage = (event) => {
      this._handleMsg(event.data);
    };

    worker.onerror = function(error) {
      throw error;
    };

    if (this.wop === (worker as any).port) this.wop.start();
    return this.wop;
  }

  /*
    send
      sends message to worker
  */
  send = (action, data) => {
    this.wop.postMessage({action,data});
  }

  /*
    on
      subscribe to event
  */
  on = (action, fn) => {
    if (!this.listeners[action]) {
      this.listeners[action] = [];
    }
    this.listeners[action].push(fn);
  }

  /*
    off
      unsubscribe from event
  */
  off = (action, fn) => {
    if (!this.listeners[action]) return;
    const idx = this.listeners[action].indexOf(fn);
    if (idx <= 0) return;
    this.listeners[action].splice(idx,1);
  }

  /*
    _handleMsg
      handles message passing from worker to listeners
  */
  _handleMsg = (msg) => {
    if (msg && this.listeners[msg.action]) {
      this.listeners[msg.action].forEach(l => l(msg.data));
    }
  }
}
