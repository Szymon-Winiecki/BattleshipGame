#pragma once

#include <vector>

#include "./Voting.h"
#include "./Map.h"

class ShotVoting : public Voting
{
private:
    Map* map;

    std::vector<int> decodeVote(std::string& votestr, char separator);
    bool validateShot(int x, int y);
    bool validate(Vote& vote);

public:
    ShotVoting(std::string gameId, std::list<Player>* allowedPlayers, long duration, Map* map);
    ShotVoting(std::string gameId, std::list<Player>* allowedPlayers, long startTime, long duration, Map* map);
};
