
// worker script
const WORKER_SCRIPT = 'worker.bundle.js';

const USE_SHARED_WORKER = false;

// get worker singleton
let _instance;
export function worker() {
  if (!_instance) {
    _instance = new WorkerHost(WORKER_SCRIPT);
  }
  return _instance;
}

// worker host adapter
export class WorkerHost {
  wop: MessagePort;
  listeners: any = {};

  constructor(private src: string) {
    this.startWorker();
  }

  startWorker() {
    const SharedWorker = USE_SHARED_WORKER && (window as any).SharedWorker;
    const worker = new (SharedWorker || Worker)(this.src);
    this.wop = ((worker as any).port || worker);

    this.wop.onmessage = (event) => {
      this.handleMsg(event.data);
    };

    worker.onerror = function(error) {
      throw error;
    };

    if (this.wop === (worker as any).port) this.wop.start();
    return this.wop;
  }

  on = (action, fn) => {
    if (!this.listeners[action]) {
      this.listeners[action] = [];
    }
    this.listeners[action].push(fn);
  }
  off = (action, fn) => {
    if (!this.listeners[action]) return;
    const idx = this.listeners[action].indexOf(fn);
    if (idx <= 0) return;
    this.listeners[action].splice(idx,1);
  }

  handleMsg = (msg) => {
    if (msg && this.listeners[msg.action]) {
      this.listeners[msg.action].forEach(l => l(msg.data));
    }
  }

  send = (action, data) => {
    this.wop.postMessage({action,data});
  }
}
