#include <node_api.h>
#include "NodeApiJsiRuntime.h"
#include "HelloWorld.hpp"
#include <NitroModules/HybridClassRegistry.hpp>
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
    auto hello = jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, "jsiHello"), 1,
        [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value* args, size_t count) -> jsi::Value {
          if (count != 1 || !args[0].isString()) {
            throw jsi::JSError(rt, "jsiHello expects one string argument");
          }
          return jsi::String::createFromUtf8(rt, "Hello, " + args[0].asString(rt).utf8(rt) + "! From JSI on Node.js.");
        });
    runtime.global().setProperty(runtime, "jsiHello", hello);

    margelo::nitro::HybridClassRegistry::registerHybridClass("HelloWorld", HelloWorld::Class::get());
    margelo::nitro::install(runtime);

    // Both APIs are installed through JSI into the real Node global object.
    napi_value global;
    if (napi_get_global(env, &global) != napi_ok) throw std::runtime_error("Cannot access Node global");
    for (const char* name : {"jsiHello", "NitroModulesProxy"}) {
      napi_value value;
      if (napi_get_named_property(env, global, name, &value) != napi_ok ||
          napi_set_named_property(env, exports, name, value) != napi_ok) {
        throw std::runtime_error("Cannot export installed JSI bindings");
      }
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
