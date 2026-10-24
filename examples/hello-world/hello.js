import { jsiHello, HelloWorld } from "./index.js";

console.log(jsiHello("macOS"));
const hello = new HelloWorld();
console.log(hello.greet("macOS"));
console.log(hello.toString());
