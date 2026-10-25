# Hello World

This workspace is userland: it depends on `nitro-node` through `workspace:*` and owns all demo behavior.

- `src/HelloWorld.hpp` and `src/HelloWorld.cpp` define the Nitro HybridObject and its `greet` method.
- `src/addon.cpp` registers that class and installs the plain JSI `jsiHello` function.
- `CMakeLists.txt` builds `hello_world.node` against the host's shared runtime.
- `index.js` loads that addon and exports the demo's JavaScript API.
- `hello.js` runs the example; `test/` tests its behavior, including Workers.

From the repository root:

```sh
pnpm --filter hello-world... build
pnpm --filter hello-world hello
pnpm --filter hello-world test
```

Both workspaces use `"build": "cmake-js compile"`. The `...` filter builds `nitro-node` first, following workspace dependencies. Alternatively, run `pnpm build` at the repository root to build every workspace in dependency order. Once the host has been built, `pnpm --filter hello-world build` builds only this example.

The example's CMake configuration locates the SDK through the installed `nitro-node/cmake` export. Neither the host's source nor its build configuration refers to this example. The output is `build/Release/hello_world.node`.

The JavaScript API is:

```js
import { HelloWorld, jsiHello } from "hello-world";

console.log(jsiHello("World"));
console.log(new HelloWorld().greet("World"));
```
