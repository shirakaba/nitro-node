cmake_minimum_required(VERSION 3.20)
project(hello_world LANGUAGES CXX)

# Locate the SDK through the installed dependency, including pnpm workspace links.
# NitroNode_DIR can also be supplied explicitly by a CMake user.
if(NOT NitroNode_DIR)
  find_program(NODE_EXECUTABLE NAMES node REQUIRED)
  execute_process(
    COMMAND "${NODE_EXECUTABLE}" --input-type=module -e [=[
      import { dirname } from 'node:path';
      import { fileURLToPath } from 'node:url';
      process.stdout.write(dirname(fileURLToPath(import.meta.resolve('nitro-node/cmake'))));
    ]=]
    WORKING_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}"
    OUTPUT_VARIABLE NitroNode_DIR
    COMMAND_ERROR_IS_FATAL ANY
  )
endif()
find_package(NitroNode CONFIG REQUIRED)
nitro_node_add_addon(hello_world src/addon.cpp src/HelloWorld.cpp src/HelloWorldBindings.cpp)
