#import <React/RCTBridgeModule.h>
#import <ReactCommon/RCTTurboModule.h>
#import <ReactCommon/RCTTurboModuleWithJSIBindings.h>
#include <NitroModules/InstallNitro.hpp>
#include "../src/HelloWorldBindings.hpp"
#include <thread>

// RN 0.83's runtime-installation hook is sufficient for this C++ module; the
// Nitro nightly's SwiftPM adapter requires the newer RN build system.
namespace {
class CallInvokerDispatcher final : public margelo::nitro::Dispatcher {
public:
  explicit CallInvokerDispatcher(std::shared_ptr<facebook::react::CallInvoker> invoker)
      : invoker_(std::move(invoker)), thread_(std::this_thread::get_id()) {}

  void runAsync(std::function<void()>&& function) override { invoker_->invokeAsync(std::move(function)); }
  void runSync(std::function<void()>&& function) override { invoker_->invokeSync(std::move(function)); }
  bool isOnDispatcher() override { return std::this_thread::get_id() == thread_; }

private:
  std::shared_ptr<facebook::react::CallInvoker> invoker_;
  std::thread::id thread_;
};
}

@interface ExampleHelloWorld : NSObject <RCTBridgeModule, RCTTurboModule, RCTTurboModuleWithJSIBindings>
@end

@implementation ExampleHelloWorld
RCT_EXPORT_MODULE(ExampleHelloWorld)

+ (BOOL)requiresMainQueueSetup { return NO; }

- (void)installJSIBindingsWithRuntime:(facebook::jsi::Runtime&)runtime
                        callInvoker:(const std::shared_ptr<facebook::react::CallInvoker>&)callInvoker {
  margelo::nitro::install(runtime, std::make_shared<CallInvokerDispatcher>(callInvoker));
  installHelloWorld(runtime);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams&)params {
  return std::make_shared<facebook::react::ObjCTurboModule>(params);
}
@end
