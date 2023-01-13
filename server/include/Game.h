#pragma once

#include <string>
#include <list>
#include <sstream>
#include <stdexcept>
//#include <unordered_map>
#include <chrono>
#include <thread>
#include <iostream> //tmp

#include "./Player.h"
#include "./Client.h"
#include "./Voting.h"
#include "./Vote.h"
#include "./Map.h"


class Player;
class Voting;

class Game{
private:
    static int nextId;
    static std::string generateId();

    int maxPlayers;
    long roundDuration;

    std::string gameId;
    long startTime;

    std::list<Player> teams[2];
    Map maps[2];

    bool isOpen;
    bool started;
    int currentTeam;
    Voting* activeVoting;

    void assertTeam(int team);
public:
    Game();
    void open();
    void start();
    void nextRound();
    void runRoundController();
    void sendResult(std::string &result);

    Player* join(int team);
    void changeTeam(int team,Player* player);
    void leave(int team,Player* player);
    bool vote(Vote &vote);

    std::string getId();
    long getStartTime();

    std::list<Player>* getTeam(int team);
    std::string getSerializedMap(int team, bool showShips);
};