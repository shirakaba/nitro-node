get_filename_component(NITRO_NODE_PACKAGE_DIR "${CMAKE_CURRENT_LIST_DIR}/.." ABSOLUTE)
set(runtime_targets "${NITRO_NODE_PACKAGE_DIR}/build/NitroNodeTargets.cmake")

if(NOT EXISTS "${runtime_targets}")
  message(FATAL_ERROR "Build nitro-node before its addons. In this monorepo, run pnpm build or pnpm --filter hello-world... build.")
endif()

if(NOT TARGET NitroNode::runtime)
  include("${runtime_targets}")
endif()
include("${CMAKE_CURRENT_LIST_DIR}/AddAddon.cmake")
