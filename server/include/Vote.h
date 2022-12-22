#pragma once

#include <string>
#include <chrono>

class Vote
{
private:
    std::string playerId;
    std::string gameId;
    std::string votingId;
    std::string vote;
    long time;
public:
    Vote(std::string playerId, std::string gameId, std::string votingId, std::string vote);
    std::string getPlayerId();
    std::string getGameId();
    std::string getVotingId();
    std::string getVote();
    long getTime();
};
