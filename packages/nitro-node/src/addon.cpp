#include <node_api.h>
#include "NodeApiJsiRuntime.h"
#include <NitroModules/InstallNitro.hpp>
#include <memory>
#include <stdexcept>

namespace {
using namespace Microsoft::NodeApiJsi;
namespace jsi = facebook::jsi;

// Each Node environment (including each Worker) owns its own JSI runtime and
// function table. Only the environment's JS thread may enter this runtime.
struct AddonState {
  LibFuncResolver resolver{nullptr};
  JSRuntimeApi api{&resolver};
  std::unique_ptr<jsi::Runtime> runtime;

  explicit AddonState(napi_env env) {
    JSRuntimeApi::setCurrent(&api);
    runtime = makeNodeApiJsiRuntime(env, &api, [] {});
  }

  ~AddonState() {
    JSRuntimeApi::setCurrent(&api);
    runtime.reset();
    JSRuntimeApi::setCurrent(nullptr);
  }
};

napi_value initialize(napi_env env, napi_value exports) {
  try {
    auto state = std::make_unique<AddonState>(env);
    auto& runtime = *state->runtime;
    margelo::nitro::install(runtime);

    // User addons receive this opaque runtime handle through loadAddon().
    napi_value runtimeHandle;
    if (napi_create_external(env, &runtime, nullptr, nullptr, &runtimeHandle) != napi_ok ||
        napi_set_named_property(env, exports, "runtimeHandle", runtimeHandle) != napi_ok) {
      throw std::runtime_error("Cannot export JSI runtime handle");
    }

    napi_value global;
    if (napi_get_global(env, &global) != napi_ok) throw std::runtime_error("Cannot access Node global");
    napi_value proxy;
    if (napi_get_named_property(env, global, "NitroModulesProxy", &proxy) != napi_ok ||
        napi_set_named_property(env, exports, "NitroModulesProxy", proxy) != napi_ok) {
      throw std::runtime_error("Cannot export installed Nitro bindings");
    }
    if (napi_add_env_cleanup_hook(env, [](void* data) { delete static_cast<AddonState*>(data); }, state.get()) != napi_ok) {
      throw std::runtime_error("Cannot register JSI runtime cleanup");
    }
    state.release();
    return exports;
  } catch (const std::exception& error) {
    napi_throw_error(env, nullptr, error.what());
    return nullptr;
  }
}
} // namespace

NAPI_MODULE(nitro_node, initialize)
