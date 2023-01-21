#pragma once

#include <string>
#include <list>
#include <chrono>
#include <sstream>
#include <unordered_map>
#include <unordered_set>

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
    std::unordered_set<std::string> playersThatVoted;
    std::unordered_map<std::string, int> votes;

    long startTime;
    long duration;

    bool validateVoting(std::string votingId);
    bool validateGame(std::string gameId);
    bool validateTime(long time);
    bool validatePlayer(std::string playerId);
    bool validateIfVotedOnce(std::string playerId);

protected:
    virtual bool validate(Vote& vote);

public:
    Voting(std::string gameId, std::list<Player>* allowedPlayers, long duration);
    Voting(std::string gameId, std::list<Player>* allowedPlayers, long startTime, long duration);
    std::string getVotingId();
    bool vote(Vote& vote);
    std::string getResult();
    std::string getRanking();
    long getEndTime();
};