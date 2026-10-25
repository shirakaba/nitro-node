#include <nitro-node/Addon.hpp>
#include "HelloWorldBindings.hpp"

NAPI_MODULE(hello_world, nitro_node::initializeAddon<installHelloWorld>)
