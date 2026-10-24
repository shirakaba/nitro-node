cmake_minimum_required(VERSION 3.20)
project(nitro_node LANGUAGES CXX)

if(NOT APPLE)
  message(FATAL_ERROR "This proof of concept currently targets macOS.")
endif()

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

foreach(required_path NODE_INCLUDE_DIR JSI_DIR NITRO_DIR)
  if(NOT IS_DIRECTORY "${${required_path}}")
    message(FATAL_ERROR "${required_path} must point to an existing directory.")
  endif()
endforeach()

set(NODE_API_JSI_DIR "${CMAKE_CURRENT_SOURCE_DIR}/vendor/node-api-jsi")
file(GLOB NITRO_CORE_SOURCES CONFIGURE_DEPENDS "${NITRO_DIR}/cpp/core/src/*.cpp")
file(GLOB NITRO_APPLE_CORE_SOURCES CONFIGURE_DEPENDS "${NITRO_DIR}/apple/core/src/*.cpp")

add_library(nitro_node MODULE
  src/addon.cpp
  src/HelloWorld.cpp
  ${NODE_API_JSI_DIR}/src/NodeApiJsiRuntime.cpp
  ${NODE_API_JSI_DIR}/src/ApiLoaders/NodeApi.cpp
  ${NODE_API_JSI_DIR}/src/ApiLoaders/NodeApi_posix.cpp
  ${NODE_API_JSI_DIR}/src/ApiLoaders/JSRuntimeApi.cpp
  ${JSI_DIR}/jsi/jsi.cpp
  ${NITRO_CORE_SOURCES}
  ${NITRO_APPLE_CORE_SOURCES}
)

target_include_directories(nitro_node PRIVATE
  "${NODE_INCLUDE_DIR}"
  "${NODE_API_JSI_DIR}/node-api"
  "${NODE_API_JSI_DIR}/src"
  "${JSI_DIR}"
  "${NITRO_DIR}/cpp/core/include"
  "${NITRO_DIR}/apple/core/include"
)
# Select node-api-jsi's newest implemented branches. All translation units use
# the same installed RN 0.88 JSI headers; this is not a JSI ABI compatibility flag.
target_compile_definitions(nitro_node PRIVATE JSI_VERSION=21 NAPI_VERSION=8)
target_compile_options(nitro_node PRIVATE -fblocks -Wno-nullability-completeness)
# The upstream delay loader intentionally computes offsets into its API tables.
set_source_files_properties(
  ${NODE_API_JSI_DIR}/src/ApiLoaders/NodeApi.cpp
  ${NODE_API_JSI_DIR}/src/ApiLoaders/JSRuntimeApi.cpp
  PROPERTIES COMPILE_OPTIONS "-Wno-invalid-offsetof"
)
# Only Node's entry points may be resolved by the host at load time. Other
# missing symbols (in particular JSI/Nitro dependencies) must fail the build.
foreach(node_symbol napi_add_env_cleanup_hook napi_get_global napi_get_named_property napi_set_named_property napi_throw_error)
  target_link_options(nitro_node PRIVATE "LINKER:-U,_${node_symbol}")
endforeach()
set_target_properties(nitro_node PROPERTIES PREFIX "" SUFFIX ".node")
