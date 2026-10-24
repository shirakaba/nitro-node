#pragma once

#include <node_api.h>
#include <jsi/jsi.h>
#include <exception>
#include <stdexcept>

namespace nitro_node {

// The public native entry point for user addons. The host owns the runtime and
// passes its opaque handle when JavaScript calls loadAddon().
template <void (*Install)(facebook::jsi::Runtime&)>
napi_value initializeAddon(napi_env env, napi_value exports) {
  napi_value install;
  napi_status status = napi_create_function(
      env, "install", NAPI_AUTO_LENGTH,
      [](napi_env env, napi_callback_info info) -> napi_value {
        try {
          size_t count = 1;
          napi_value argument;
          void* runtime = nullptr;
          if (napi_get_cb_info(env, info, &count, &argument, nullptr, nullptr) != napi_ok || count != 1 ||
              napi_get_value_external(env, argument, &runtime) != napi_ok || runtime == nullptr) {
            throw std::runtime_error("Use nitro-node's loadAddon() to install native bindings");
          }
          Install(*static_cast<facebook::jsi::Runtime*>(runtime));
          napi_value result;
          if (napi_get_undefined(env, &result) != napi_ok) {
            throw std::runtime_error("Cannot complete native addon installation");
          }
          return result;
        } catch (const std::exception& error) {
          napi_throw_error(env, nullptr, error.what());
          return nullptr;
        }
      },
      nullptr, &install);
  if (status != napi_ok || napi_set_named_property(env, exports, "install", install) != napi_ok) {
    napi_throw_error(env, nullptr, "Cannot create native addon installer");
    return nullptr;
  }
  return exports;
}

} // namespace nitro_node
