#include "../include/Vote.h"

Vote::Vote(std::string playerId, std::string gameId, std::string votingId, std::string vote) :
    playerId{ playerId },
    gameId{ gameId },
    votingId{ votingId },
    vote{ vote },
    time{ std::chrono::duration_cast< std::chrono::milliseconds >(std::chrono::system_clock::now().time_since_epoch()).count() } { }

std::string Vote::getPlayerId()
{
    return playerId;
}

std::string Vote::getGameId()
{
    return gameId;
}

std::string Vote::getVotingId()
{
    return votingId;
}

std::string Vote::getVote()
{
    return vote;
}

long Vote::getTime()
{
    return time;
}