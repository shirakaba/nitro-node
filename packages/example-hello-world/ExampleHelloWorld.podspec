require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = 'ExampleHelloWorld'
  s.version = package['version']
  s.summary = 'The shared C++ HelloWorld Nitro v1 module, hosted by React Native.'
  s.homepage = 'https://github.com/shirakaba/nitro-node'
  s.license = 'MIT'
  s.author = 'Jamie Birch'
  s.source = { :git => 'https://github.com/shirakaba/nitro-node.git', :tag => s.version.to_s }
  s.platforms = { :ios => '15.1', :osx => '14.0' }
  s.source_files = 'apple/*.{h,mm}', 'src/HelloWorld*.{hpp,cpp}'
  s.dependency 'NitroCore'
  install_modules_dependencies(s)
end
