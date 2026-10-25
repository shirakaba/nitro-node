# example-hello-world

This workspace owns the example Nitro module and depends on `nitro-node` through `workspace:*`. Importing it loads no native code and installs no globals. It is marked `"sideEffects": false`.

- `src/HelloWorld.hpp` and `src/HelloWorld.cpp` define the Nitro HybridObject and its `greet` method.
- `src/addon.cpp` registers that class and installs the plain JSI `jsiHello` function.
- `CMakeLists.txt` builds `hello_world.node` against the host's shared runtime.
- `addon.js` exports an explicit, idempotent `init()` function.
- `addon.d.ts` describes the returned bindings and the module's optional `jsiHello` global.
- `test/` tests the module's behavior, including deferred initialization and Workers.

The consumer application lives in [`demos/hello-world`](../../demos/hello-world).

From the repository root:

```sh
pnpm --filter example-hello-world... build
pnpm --filter example-hello-world test
pnpm --filter example-hello-world typecheck
```

Both native workspaces use `"build": "cmake-js compile"` and `"install": "node --run build"`, with cmake-js in `dependencies`. A workspace `pnpm install` builds `nitro-node` first. For rebuilding after native source changes, the `...` filter builds `nitro-node` first, following workspace dependencies. Alternatively, run `pnpm build` at the repository root to rebuild the native workspaces in dependency order. Once the host has been built, `pnpm --filter example-hello-world build` builds only this module.

The example's CMake configuration locates the SDK through the installed `nitro-node/cmake` export. Neither the host's source nor its build configuration refers to this example. The output is `build/Release/hello_world.node`.

Initialize and consume the bindings explicitly:

```js
import { init } from "example-hello-world";

const { HelloWorld, jsiHello } = init();
console.log(jsiHello("World"));
console.log(new HelloWorld().greet("World"));
```

`init()` initializes the host, loads this module's native addon, and returns the same bindings object on repeated calls. Native globals are created during initialization. Each Worker initializes its own bindings.
