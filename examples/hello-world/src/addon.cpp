#include <nitro-node/Addon.hpp>
#include <NitroModules/HybridClassRegistry.hpp>
#include "HelloWorld.hpp"

namespace {
namespace jsi = facebook::jsi;

void installHelloWorld(jsi::Runtime& runtime) {
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
}
} // namespace

NAPI_MODULE(hello_world, nitro_node::initializeAddon<installHelloWorld>)
