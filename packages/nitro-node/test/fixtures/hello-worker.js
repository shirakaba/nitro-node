import { parentPort, workerData } from "node:worker_threads";
import { setImmediate } from "node:timers";

const { jsiHello, NitroModulesProxy } = await import(workerData);
const HelloWorld = NitroModulesProxy.getHybridClass("HelloWorld");
setImmediate(() => {
  parentPort.postMessage([jsiHello("Worker"), new HelloWorld().greet("Worker")]);
});
