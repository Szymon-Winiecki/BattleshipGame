#pragma once

#include <vector>
#include <list>
#include <string>
#include <sstream>

enum class FieldStatus : int{
    CLEAR = 0,  // pole puste lub status nieznany
    SHIP = 1,   //nieuszkodzony statek
    MISS = 2,   //pudlo
    HIT = 3,    //trafiony statek
    SUNK = 4,   //zatopiony statek
    INVALID_FIELD = 5   //nieprawidlowe pole (np. o wspolzednych poza mapa)
};

class Map
{
private:
    std::vector<std::vector<FieldStatus>> map;
    bool validCoords(int x, int y);
    bool validCoords1(int row, int col, int size, bool isHorizontal);
public:
    /*  tworzy mape o wymiarach size x size*/
    Map(int size);

    /*  zwraca rozmiar planszy (szerokosc, ale plansza jest kwadratowa wiec rowniez dlugosc)*/
    int getSize();

    /*  zwraca status pola o podanych koordyantach*/
    FieldStatus getStatus(int x, int y);

    /*  strzal w pole [x,y]. Wykonywana jest odpowiednia akcja w zaleznosci od typu pola w jakie trafiono.
        Zwracany jest stan trafionego pola po wykonaniu akcji. Jezeli pole jest poza plansza zwaracana jest warotsc FieldStatus::INVALID_FIELD*/
    FieldStatus shoot(int x, int y);

    /*  stawia statek na planszy, jezeli argument horizontal == true, to statek ustawiony jest poziomo, zaczynajac od pola [x,y] w prawo,
        natomiast jezeli horizontal == false, to statek ustawiony jest pionowo od pola [x,y] w dół. size okresla dlugosc statku.
        -------->Jezeli statek nie miesci sie na planszy, zwracana jest wartosc false, w przeciwnym wypadku true--chyba nie sprawdzamy tego i tak?chyba ze dodamy------*/
    //void placeShip(int x, int y, int size, bool horizontal);
    void placeShip(int size);

    bool allShipsSunk();

    std::vector<int> getAnyShootableField();

    /*  zwraca mape w zapisana w postacji size|00011020... gdzie size to rozmiar mapy(szerokosc), | to separator (delimeter),
        a kolejne znaki to pola planszy (najpierw cały pierwszy rząd, potem drugi itd), pola nie są separowane, bo kazde zajmuje dokladenie jeden znak */
    std::string serialize(bool noShips, char delimeter);

    /*  zwraca mape w postaci czetelnej dla czlowieka - cyfry zastapione sa znakami i dodane sa znaki nowej linii miedzy wierszami*/
    std::string print(bool noShips, char delimeter);

};
