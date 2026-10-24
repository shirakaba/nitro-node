#pragma once

#include <NitroModules/HybridObject.hpp>
#include <string>

class HelloWorld final : public margelo::nitro::HybridObject {
public:
  struct Class {
    using Base = HybridObject::Class;
    static constexpr const char* name = "HelloWorld";
    static const std::shared_ptr<const margelo::nitro::HybridClass>& get();
  };

  static std::shared_ptr<HelloWorld> create();
  std::string greet(const std::string& name);

protected:
  const std::shared_ptr<const margelo::nitro::HybridClass>& getHybridClass() override;
};
