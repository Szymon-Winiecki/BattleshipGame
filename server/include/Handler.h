#pragma once
#include <cstdint>

struct Handler {
    virtual ~Handler(){}
    virtual void handleEvent(uint32_t events) = 0;
};