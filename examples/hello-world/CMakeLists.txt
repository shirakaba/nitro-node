cmake_minimum_required(VERSION 3.20)
project(hello_world LANGUAGES CXX)

find_package(NitroNode CONFIG REQUIRED)
nitro_node_add_addon(hello_world src/addon.cpp src/HelloWorld.cpp)
