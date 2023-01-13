#pragma once

#include <vector>
#include <list>
#include <string>
#include <sstream>

enum class FieldStatus : int{
    CLEAR = 0,
    SHIP = 1,
    MISS = 2,
    HIT = 3,
    SUNK = 4,
    INVALID_FIELD = 5
};

class Map
{
private:
    std::vector<std::vector<FieldStatus>> map;
    bool validCoords(int x, int y);
public:
    Map(int size);
    int getSize();
    FieldStatus shoot(int x, int y);
    bool placeShip(int x, int y, int size, bool horizontal);
    std::string serialize(bool noShips, char delimeter);
    std::string print(bool noShips, char delimeter);
};
