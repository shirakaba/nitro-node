# nitro-node

The reusable Node.js host for Nitro v1. This workspace owns:

- The node-api-jsi runtime and its lifetime in each Node environment, including Workers.
- Explicit initialization through `init()`, which returns `NitroModulesProxy`.
- `loadAddon()`, which loads a user's native addon into that runtime.
- The shared native library containing JSI and Nitro, plus the CMake SDK for user addons.

User modules live in separate workspaces. The example native module is [example-hello-world](../example-hello-world); its consumer application is [demos/hello-world](../../demos/hello-world).

## JavaScript API

```js
import { init, loadAddon } from "nitro-node";

const NitroModulesProxy = init();
loadAddon(new URL("./build/Release/my_module.node", import.meta.url));
const MyModule = NitroModulesProxy.getHybridClass("MyModule");
const instance = new MyModule();
```

Importing `nitro-node` loads no native code and installs no globals. `init()` synchronously loads the host, initializes the JSI runtime, and returns its populated proxy. It is idempotent within each Node environment: repeated calls return the same proxy without loading or installing Nitro again. Native binaries must be built before calling it.

Nitro's own `install(runtime)` creates `globalThis.NitroModulesProxy`, and `nitro-core` reads that global as its entry point. The host preserves this upstream contract. The global is absent before `init()` and present afterward; the returned proxy has a non-optional type.

`loadAddon()` requires `init()` to have completed first. It accepts a file URL or filesystem path and caches successful installations by absolute path. Native loading uses `process.dlopen()`, and the runtime handle stays private to the loader.

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

## Building with cmake-js

Both the host and user addons use [cmake-js](https://github.com/cmake-js/cmake-js). Add `cmake-js` as a development dependency and use this package configuration:

```json
{
  "scripts": {
    "build": "cmake-js compile"
  },
  "binary": {
    "napi_versions": [8]
  }
}
```

The `binary` setting tells cmake-js to use its bundled Node-API headers. The build does not need a separately installed Node header directory or a Node header download.

The user's `CMakeLists.txt` discovers the installed SDK and links against its shared runtime:

```cmake
cmake_minimum_required(VERSION 3.20)
project(my_module LANGUAGES CXX)

find_program(NODE_EXECUTABLE NAMES node REQUIRED)
execute_process(
  COMMAND "${NODE_EXECUTABLE}" --input-type=module -e "import { dirname } from 'node:path'; import { fileURLToPath } from 'node:url'; process.stdout.write(dirname(fileURLToPath(import.meta.resolve('nitro-node/cmake'))));"
  WORKING_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}"
  OUTPUT_VARIABLE NitroNode_DIR
  COMMAND_ERROR_IS_FATAL ANY
)
find_package(NitroNode CONFIG REQUIRED)
nitro_node_add_addon(my_module src/addon.cpp)
```

Node's ESM resolver locates the SDK through the installed `nitro-node` dependency, including pnpm workspace links. `NitroNode_DIR` may also be supplied explicitly to CMake. The SDK target carries the shared runtime, JSI/Nitro include paths, and matching compile settings; `nitro_node_add_addon` also consumes cmake-js's Node include/library/source settings.

Build the host before building its addons. In this monorepo, `pnpm build` builds native workspaces in dependency order; `pnpm --filter example-hello-world... build` builds the example module and its workspace dependencies. An addon's own `pnpm build` runs only cmake-js for that addon. The host and all user addons share one copy of Nitro's class registry and JSI implementation. The current SDK imports targets from the host's local build; distributing relocatable SDKs/prebuilds remains future work.

cmake-js places Release binaries in `build/Release`, which the JavaScript entry points load with `process.dlopen()`.

Build and test the host independently:

```sh
pnpm --filter nitro-node build
pnpm --filter nitro-node test
```
