# nitro-node

The reusable Node.js host for Nitro v1. This workspace owns:

- The node-api-jsi runtime and its lifetime in each Node environment, including Workers.
- Installation and export of `NitroModulesProxy`.
- `loadAddon()`, which loads a user's native addon into that runtime.
- The shared native library containing JSI and Nitro, plus native addon build helpers.

User modules live in separate workspaces. The complete example is [hello-world](../../examples/hello-world).

## JavaScript API

```js
import { loadAddon, NitroModulesProxy } from "nitro-node";

loadAddon(new URL("./build/my_module.node", import.meta.url));
const MyModule = NitroModulesProxy.getHybridClass("MyModule");
const instance = new MyModule();
```

`loadAddon()` accepts a file URL or filesystem path and caches successful installations by absolute path. The library's ESM entry point loads native addons with `process.dlopen()`. The runtime handle stays private to the loader.

## Native addon contract

A user addon provides a function that installs its own JSI bindings or registers its own Nitro classes:

```cpp
#include <nitro-node/Addon.hpp>

void installMyModule(facebook::jsi::Runtime& runtime) {
  // Install this module's bindings or register its HybridClass here.
}

NAPI_MODULE(my_module, nitro_node::initializeAddon<installMyModule>)
```

`initializeAddon` exposes the native installer expected by `loadAddon()`, passes in the host's runtime, and translates installation errors back to JavaScript. Installers run synchronously on the calling environment's JavaScript thread.

The user's `CMakeLists.txt` links against the host's shared runtime:

```cmake
cmake_minimum_required(VERSION 3.20)
project(my_module LANGUAGES CXX)
find_package(NitroNode CONFIG REQUIRED)
nitro_node_add_addon(my_module src/addon.cpp)
```

From the user's `scripts/build.js`:

```js
import { buildAddon } from "nitro-node/build";

buildAddon(new URL("..", import.meta.url));
```

`buildAddon()` first builds the host and then the user's CMake project. It supplies the `NitroNode` CMake package, including the shared runtime and matching include paths/compile settings. The host and all user addons share one copy of Nitro's class registry and JSI implementation. The current CMake package references the local checkout and build directory; distributing relocatable packages/prebuilds remains future work.

Build and test the host independently:

```sh
pnpm --filter nitro-node build
pnpm --filter nitro-node test
```
