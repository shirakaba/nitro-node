// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

#include "NodeApi.h"
#include <dlfcn.h>
#include <stdexcept>

namespace Microsoft::NodeApiJsi {

LibHandle LibLoader::loadLib(const char *libName) {
  auto handle = dlopen(libName, RTLD_LAZY | RTLD_LOCAL);
  if (handle == nullptr) {
    throw std::runtime_error(dlerror());
  }
  return reinterpret_cast<LibHandle>(handle);
}

FuncPtr LibLoader::getFuncPtr(LibHandle libHandle, const char *funcName) {
  return reinterpret_cast<FuncPtr>(dlsym(reinterpret_cast<void*>(libHandle), funcName));
}

} // namespace Microsoft::NodeApiJsi
