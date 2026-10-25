#include "HelloWorld.hpp"
#include <NitroModules/JSIConverter.hpp>

using margelo::nitro::HybridClass;

const std::shared_ptr<const HybridClass>& HelloWorld::Class::get() {
  static const auto descriptor = HybridClass::create<Class>([](HybridClass& type) {
    type.registerHybridConstructor(&HelloWorld::create);
    type.registerHybridMethod("greet", &HelloWorld::greet);
  });
  return descriptor;
}

std::shared_ptr<HelloWorld> HelloWorld::create() {
  return std::make_shared<HelloWorld>();
}

std::string HelloWorld::greet(const std::string& name) {
  return "Hello, " + name + "! From Nitro v1.";
}

const std::shared_ptr<const HybridClass>& HelloWorld::getHybridClass() {
  return Class::get();
}
