#include "../include/Map.h"

Map::Map(int size)
{
    if(size < 0){
        size = 0;
    }

    this->map.resize(size);
    for(int i = 0; i < map.size(); ++i){
        this->map[i].resize(size, FieldStatus::CLEAR);
    }
}

int Map::getSize(){
    return map.size();
}

FieldStatus Map::getStatus(int x, int y){
    if(!validCoords(x, y)){
        return FieldStatus::INVALID_FIELD;
    }
    return map[x][y];
}

FieldStatus Map::shoot(int x, int y){
    if(!validCoords(x, y)){
        return FieldStatus::INVALID_FIELD;
    }

    FieldStatus current = map[x][y];
    FieldStatus next = current;

    if(current == FieldStatus::CLEAR){
        next = FieldStatus::MISS;
    }
    if(current == FieldStatus::SHIP){
        next = FieldStatus::HIT;

        //sprawdź czy cały statek zatopiony
        std::list<std::vector<int>> ship;
        ship.push_back({x, y});
        bool sunk = true;
        for(int i = x+1; i < this->getSize() && sunk; ++i){
            if(map[i][y] == FieldStatus::SHIP){
                sunk = false;
            }
            else if(map[i][y] != FieldStatus::HIT){
                break;
            }
            else{
                ship.push_back({i, y});
            }
        }
        for(int i = x-1; i >= 0 && sunk; --i){
            if(map[i][y] == FieldStatus::SHIP){
                sunk = false;
            }
            else if(map[i][y] != FieldStatus::HIT){
                break;
            }
            else{
                ship.push_back({i, y});
            }
        }
        for(int i = y+1; i < this->getSize() && sunk; ++i){
            if(map[x][i] == FieldStatus::SHIP){
                sunk = false;
            }
            else if(map[x][i] != FieldStatus::HIT){
                break;
            }
            else{
                ship.push_back({x, i});
            }
        }
        for(int i = y-1; i >= 0 && sunk; --i){
            if(map[x][i] == FieldStatus::SHIP){
                sunk = false;
            }
            else if(map[x][i] != FieldStatus::HIT){
                break;
            }
            else{
                ship.push_back({x, i});
            }
        }
        if(sunk){
            next = FieldStatus::SUNK;
            for(std::vector<int> field : ship){
                map[field[0]][field[1]] = FieldStatus::SUNK;
            }
        }
    }

    map[x][y] = next;
    return next;
}

bool Map::placeShip(int x, int y, int size, bool horizontal){
    if(!validCoords(x, y)) return false;

    if(horizontal){
        if(!validCoords(x + size, y)) return false;

        for(int i = x; i < x + size; ++i){
            map[i][y] = FieldStatus::SHIP;
        }
    }
    else{ //vertical
        if(!validCoords(x, y + size)) return false;

        for(int i = y; i < y + size; ++i){
            map[x][i] = FieldStatus::SHIP;
        }
    }
    
    return true;
}

void Map::placeShip(int size){
    bool horizontal = rand() % 2;
    int row = rand() % this->getSize();
    int col = rand() % this->getSize();
    if (validCoords1(row, col, size, horizontal)) {
        if (horizontal) {
            for (int i = col; i < col + size; i++) {
                map[row][i] = FieldStatus::SHIP;
            }
        } 
        else {
            for (int i = row; i < row + size; i++) {
                map[i][col] = FieldStatus::SHIP;
            }
        }
    } 
    else {
        placeShip(size);
    }
}

bool Map::allShipsSunk(){
    for(int y = 0; y < getSize(); ++y){
        for(int x = 0; x < getSize(); ++x){
            if(map[x][y] == FieldStatus::SHIP){
                return false;
            }
        }
    }
    return true;
}

std::string Map::serialize(bool noShips, char delimeter){
    std::stringstream serialized;
    serialized << getSize() << delimeter;
    for(int y = 0; y < getSize(); ++y){
        for(int x = 0; x < getSize(); ++x){
            if(noShips && map[x][y] == FieldStatus::SHIP){
                serialized << static_cast<int>(FieldStatus::CLEAR);
            }
            else{
                serialized << static_cast<int>(map[x][y]);
            }
        }
    }

    return serialized.str();
}

std::string Map::print(bool noShips, char delimeter){

    std::vector<char> translator = {'~', '#', '*', 'X', 'V', 'E'};

    std::stringstream serialized;
    for(int y = 0; y < getSize(); ++y){
        for(int x = 0; x < getSize(); ++x){
            if(noShips && map[x][y] == FieldStatus::SHIP){
                serialized << translator[static_cast<int>(FieldStatus::CLEAR)] << delimeter;
            }
            else{
                serialized << translator[static_cast<int>(map[x][y])] << delimeter;
            }
        }
        serialized << '\n';
    }

    return serialized.str();
}

bool Map::validCoords(int x, int y){
    if(x < 0 || x > this->getSize() || y < 0 || y > this->getSize()){
        return false;
    }
    return true;
}

bool Map::validCoords1(int row, int col, int size, bool horizontal) {
  if (horizontal) {
    if (col + size + 1 > this->getSize()) {
      return false;
    }
    for (int i = col - 1; i < col + size + 1; i++) {
      for (int j = row - 1; j <= row + 1; j++) {
        if (i < 0 || i >= this->getSize() || j < 0 || j >= this->getSize()) {
          continue;
        }
        if (map[j][i] != FieldStatus::CLEAR) {
          return false;
        }
      }
    }
  } 
  else {
    if (row + size + 1 > this->getSize()) {
      return false;
    }
    for (int i = row - 1; i < row + size + 1; i++) {
      for (int j = col - 1; j <= col + 1; j++) {
        if (i < 0 || i >= this->getSize() || j < 0 || j >= this->getSize()) {
          continue;
        }
        if (map[i][j] != FieldStatus::CLEAR) {
          return false;
        }
      }
    }
  }
  return true;
}

std::vector<int> Map::getAnyShootableField(){
    int srx = rand() % getSize();
    int sry = rand() % getSize();

    for(int y = sry; y < getSize(); ++y){
        for(int x = srx; x < getSize(); ++x){
            if(map[x][y] == FieldStatus::CLEAR || map[x][y] == FieldStatus::SHIP){
                return {x, y};
            }
        }
        srx = 0;
    }

    for(int y = 0; y <= sry; ++y){
        for(int x = 0; x < getSize(); ++x){
            if(map[x][y] == FieldStatus::CLEAR || map[x][y] == FieldStatus::SHIP){
                return {x, y};
            }
        }
    }

    return {0, 0};
}