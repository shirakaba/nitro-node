import { parentPort, workerData } from "node:worker_threads";
import { setImmediate } from "node:timers";

const { jsiHello, HelloWorld } = await import(workerData);
setImmediate(() => {
  parentPort.postMessage([jsiHello("Worker"), new HelloWorld().greet("Worker")]);
});
