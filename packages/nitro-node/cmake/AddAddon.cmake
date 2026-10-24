function(nitro_node_add_addon target)
  add_library(${target} MODULE ${ARGN})
  target_link_libraries(${target} PRIVATE NitroNode::runtime)
  set_target_properties(${target} PROPERTIES PREFIX "" SUFFIX ".node" CXX_EXTENSIONS OFF)

  # Only the Node-API calls used by the host and Addon.hpp may remain unresolved.
  # Missing JSI/Nitro symbols must fail at link time.
  foreach(node_symbol
    napi_add_env_cleanup_hook napi_create_external napi_create_function
    napi_get_cb_info napi_get_global napi_get_named_property napi_get_undefined
    napi_get_value_external napi_set_named_property napi_throw_error)
    target_link_options(${target} PRIVATE "LINKER:-U,_${node_symbol}")
  endforeach()
endfunction()
