#pragma once

#include <string>
#include <sstream>
#include <list>
#include <sstream>
#include <stdexcept>
//#include <unordered_map>
#include <chrono>
#include <thread>
#include <iostream> //tmp


#include "./Player.h"
#include "./Voting.h"
#include "./ShotVoting.h"
#include "./Vote.h"
#include "./Map.h"
#include "./Message.h"




class Player;
class Voting;
class ShotVoting;

class Game{
private:
    static int nextId;
    static std::string generateId();

    int maxPlayers;
    long roundDuration;

    std::string gameId;
    long startTime;

    Player* owner;
    std::list<Player> teams[2];
    Map maps[2];

    bool isOpen;
    bool started;
    bool finished;
    int currentTeam;
    ShotVoting* activeVoting;

    bool toDelete; //określa czy gra powinna byc usunięta po zakończeniu następnej rundy

    void sendResult(std::string &result);
    void sendNextRoundInfo();
    
    void shoot(int map, int x, int y);

    void sendCurrentTeams();

    std::string serializeTeam(int team, char separator);

    void sendToTeam(Message &message, int team);
    void sendToAllPlayers(Message &message);
    void assertTeam(int team);
public:
    /*  utworzenie gry - generowene jest id gry i inne wlasciwosci*/
    Game();

    /*  otwarcie gry - gracze moga dolaczac do gry*/
    void open();

    /*  rozpoczecie gry - rusza pierwsza runda*/
    void start();
    /*  rozpoczecie gry - rusza pierwsza runda, roundTime to czas trwania rundy w sekundach*/
    void start(int roundTime);

    /*  do zamkniętej gry nie można dołączać*/
    void close();

    bool isStarted();

    bool isFinished();

    void endGame(int team);

    /* usun grę na końcu rundy*/
    void deleteNextRound();

    void setOwner(Player* player);
    Player* getOwner();
    void removeOwner();
    Player* changeOwner();

    void nextRound();
    void runRoundController();

    /*  dolaczenie do gry do zespolu 'team' - zwracany jest wskaznik na obiekt gracza. Jezeli nie mozna dolaczyc do gry zwaracana jest wartosc NULL*/
    Player* join(int team);
    void changeTeam(int team,Player* player);
    void leave(int team,Player* player);
    bool vote(Vote &vote);
    int getNumberOfPlayers();


    std::string getId();
    long getStartTime();

    std::list<Player>* getTeam(int team);
    std::string getSerializedMap(int team, bool showShips);

    Message currentRoundInfo();
    Message currentTeamInfo(int team);
};