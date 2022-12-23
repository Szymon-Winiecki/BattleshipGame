#pragma once

#include <string>
#include <list>
#include <chrono>
#include <sstream>

#include "./Vote.h"
#include "./Player.h"

class Player;

class Voting{
private:
    static long nextId;
    static std::string generateId();

    std::string votingId;
    std::string gameId;
    std::list<Player>* allowedPlayers;
    //add list of votes

    long startTime;
    long duration;

    bool validateVoting(std::string votingId);
    bool validateGame(std::string gameId);
    bool validateTime(long time);
    bool validatePlayer(std::string playerId);

public:
    Voting(std::string gameId, std::list<Player>* allowedPlayers, long duration);
    Voting(std::string gameId, std::list<Player>* allowedPlayers, long startTime, long duration);
    std::string getVotingId();
    bool validate(Vote& vote);
};