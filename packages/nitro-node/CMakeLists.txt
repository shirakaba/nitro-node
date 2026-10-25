cmake_minimum_required(VERSION 3.20)
project(nitro_node LANGUAGES CXX)

if(NOT APPLE)
  message(FATAL_ERROR "This proof of concept currently targets macOS.")
endif()

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if(NOT CMAKE_JS_VERSION)
  message(FATAL_ERROR "Build with cmake-js (pnpm --filter nitro-node build).")
endif()

# cmake-js enables unresolved symbols for SHARED Node addons. Our addons are
# MODULE targets with explicit Node-API imports; the shared runtime is a normal
# library whose dependencies must all resolve at link time.
string(REPLACE "-undefined dynamic_lookup" "" CMAKE_SHARED_LINKER_FLAGS "${CMAKE_SHARED_LINKER_FLAGS}")

# Resolve installed dependencies using Node's ESM resolver instead of assuming
# a particular node_modules layout. cmake-js supplies the Node-API headers.
find_program(NITRO_NODE_NODE_EXECUTABLE NAMES node REQUIRED)
execute_process(
  COMMAND "${NITRO_NODE_NODE_EXECUTABLE}" --input-type=module -e [=[
    import { dirname, resolve } from 'node:path';
    import { fileURLToPath } from 'node:url';
    const nitro = dirname(fileURLToPath(import.meta.resolve('react-native-nitro-modules/package.json')));
    process.stdout.write(JSON.stringify({ nitro, jsi: resolve(nitro, '../react-native/ReactCommon/jsi') }));
  ]=]
  WORKING_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}"
  OUTPUT_VARIABLE dependency_paths
  COMMAND_ERROR_IS_FATAL ANY
)
string(JSON NITRO_DIR GET "${dependency_paths}" nitro)
string(JSON JSI_DIR GET "${dependency_paths}" jsi)

foreach(required_path JSI_DIR NITRO_DIR)
  if(NOT IS_DIRECTORY "${${required_path}}")
    message(FATAL_ERROR "${required_path} must point to an existing directory.")
  endif()
endforeach()

set(NODE_API_JSI_DIR "${CMAKE_CURRENT_SOURCE_DIR}/vendor/node-api-jsi")
file(GLOB NITRO_CORE_SOURCES CONFIGURE_DEPENDS "${NITRO_DIR}/cpp/core/src/*.cpp")
file(GLOB NITRO_APPLE_CORE_SOURCES CONFIGURE_DEPENDS "${NITRO_DIR}/apple/core/src/*.cpp")

add_library(nitro_node_runtime SHARED
  ${NODE_API_JSI_DIR}/src/NodeApiJsiRuntime.cpp
  ${NODE_API_JSI_DIR}/src/ApiLoaders/NodeApi.cpp
  ${NODE_API_JSI_DIR}/src/ApiLoaders/NodeApi_posix.cpp
  ${NODE_API_JSI_DIR}/src/ApiLoaders/JSRuntimeApi.cpp
  ${JSI_DIR}/jsi/jsi.cpp
  ${NITRO_CORE_SOURCES}
  ${NITRO_APPLE_CORE_SOURCES}
)

target_include_directories(nitro_node_runtime PUBLIC
  ${CMAKE_JS_INC}
  "${JSI_DIR}"
  "${NITRO_DIR}/cpp/core/include"
  "${NITRO_DIR}/apple/core/include"
  "${CMAKE_CURRENT_SOURCE_DIR}/include"
  PRIVATE
  # Only Microsoft's js_runtime_api.h is vendored here. Standard Node-API
  # headers are supplied by cmake-js (and its dependency on node-api-headers)
  # through CMAKE_JS_INC above.
  "${NODE_API_JSI_DIR}/node-api"
  "${NODE_API_JSI_DIR}/src"
)
# Select node-api-jsi's newest implemented branches. All translation units use
# the same installed RN 0.88 JSI headers; this is not a JSI ABI compatibility flag.
target_compile_features(nitro_node_runtime PUBLIC cxx_std_20)
target_compile_definitions(nitro_node_runtime PUBLIC JSI_VERSION=21 NAPI_VERSION=8)
target_compile_options(nitro_node_runtime PUBLIC -fblocks -Wno-nullability-completeness)
# The upstream delay loader intentionally computes offsets into its API tables.
set_source_files_properties(
  ${NODE_API_JSI_DIR}/src/ApiLoaders/NodeApi.cpp
  ${NODE_API_JSI_DIR}/src/ApiLoaders/JSRuntimeApi.cpp
  PROPERTIES COMPILE_OPTIONS "-Wno-invalid-offsetof"
)
set_target_properties(nitro_node_runtime PROPERTIES EXPORT_NAME runtime)
add_library(NitroNode::runtime ALIAS nitro_node_runtime)
include(cmake/AddAddon.cmake)

nitro_node_add_addon(nitro_node src/addon.cpp)
target_include_directories(nitro_node PRIVATE "${NODE_API_JSI_DIR}/src" "${NODE_API_JSI_DIR}/node-api")

# Downstream workspaces link this exact shared runtime, so Nitro's registry and
# JSI implementation are shared rather than compiled into each native addon.
export(TARGETS nitro_node_runtime NAMESPACE NitroNode:: FILE "${CMAKE_CURRENT_BINARY_DIR}/NitroNodeTargets.cmake")
