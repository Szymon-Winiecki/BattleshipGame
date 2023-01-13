#pragma once

#include <string>
#include <list>
#include <sstream>
#include <stdexcept>
#include <unordered_map>

#include "./Player.h"
#include "./Client.h"
#include "./Voting.h"


class Player;
class Voting;

class Game{
private:
    static int nextId;
    static std::string generateId();

    int maxPlayers;
    std::string gameId;
    std::list<Player*> teams[2];
    long startTime;
    std::unordered_map<std::string, Voting*> activeVotings;

    void assertTeam(int team);
public:
    Game();
    void open();
    void start();
    Player* join(int team);
    std::string getId();
    std::list<Player*>* getTeam(int team);
    Voting* getVoting(std::string votingId);
    void changeTeam(int team,Player* player);
    void leave(int team,Player* player);
};