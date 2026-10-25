import { parentPort, workerData } from "node:worker_threads";
import { setImmediate } from "node:timers";

const { init } = await import(workerData);
const { jsiHello, HelloWorld } = init();
setImmediate(() => {
  if (!parentPort) {
    throw new Error("Expected parentPort to be populated.");
  }
  parentPort.postMessage([jsiHello("Worker"), new HelloWorld().greet("Worker")]);
});
