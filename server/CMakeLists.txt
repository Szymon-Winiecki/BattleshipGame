cmake_minimum_required(VERSION 3.10)
project(Battleship_game)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/bin)

file(GLOB_RECURSE SOURCE_FILES 
	${CMAKE_SOURCE_DIR}/source/*.cpp
	${CMAKE_SOURCE_DIR}/source/*.c
)

file(GLOB_RECURSE HEADER_FILES 
	${CMAKE_SOURCE_DIR}/include/*.h
	${CMAKE_SOURCE_DIR}/include/*.hpp
)

add_executable(${PROJECT_NAME} ${HEADER_FILES} ${SOURCE_FILES} )

include_directories(
	"${CMAKE_SOURCE_DIR}/source"
	"${CMAKE_SOURCE_DIR}/include"
)

target_include_directories(${PROJECT_NAME}  PUBLIC
	"${CMAKE_SOURCE_DIR}/source"
	"${CMAKE_SOURCE_DIR}/include"
)
