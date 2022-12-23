# Sieciowa gra turowa - Statki

Karolina Sztolcman 148394, Szymon Winiecki 148149

## Opis rozgrywki

1. Gracze dzielą się na dwie drużyny
2. W każdej drużynie musi być przynajmniej jeden gracz
3. Losowane jest kilka możliwych ułożeń statków (inne dla obu drużyn)
4. Gracze głosują na początkowe ułożenie statków
5. Losowanie drużyny rozpoczynającej
6. Każdy gracz wybiera pole w które chce strzelić
7. Atakowane jest pole wybrane przez największą liczbę graczy (w przypadku remisu pole jest losowane spośród remisów)
8. Gracze widzą efekty danego strzału
9. Powtarzamy punkty 6-8 dla drugiej drużyny 
10. Jeżeli wszystkie statki jednej drużyny zostały zniszczone to gra się kończy
11. Powtarzamy punkty 6-11


## Uwagi do rozgrywki


- Ograniczony czas na podjęcie decyzji
- Ograniczona liczba graczy 
- Jeżeli wszyscy gracze z jednej drużyny się rozłączą gra się kończy i wygrywa druga drużyna
- Przy dołączaniu do gry gracze nadają sobie nazwy które są widoczne dla innych
- Drużyny nie muszą być równoliczne ale musi być przynajmniej jeden gracz w każdej
- Użytkownik tworzy grę z unikalnym id, inni na jego podstawie  mogą do dołączyć do tej gry jeżeli się nie rozpoczęła
- Jeżeli gracz nie zdąży zagłosować to jego ruch jest losowany

## Kompilacja i uruchomienie

### server:

Wymagane jest narzędzie CMake w wersji 3.10 lub wyższej

```
cd server
mkdir build
cd build
cmake ..
cmake --build .
```
program zostanie skompilowany do `server/bin/Battleship_game`