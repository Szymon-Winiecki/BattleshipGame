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
        for(int i = x-1; i > 0 && sunk; --i){
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
        for(int i = y-1; i > 0 && sunk; --i){
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
            for(std::vector field : ship){
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