#include "../include/ShotVoting.h"

ShotVoting::ShotVoting(std::string gameId, std::list<Player>* allowedPlayers, long duration, Map* map) : 
    Voting(gameId, allowedPlayers, duration),
    map { map } { }

ShotVoting::ShotVoting(std::string gameId, std::list<Player>* allowedPlayers, long startTime, long duration, Map* map): 
    Voting(gameId, allowedPlayers, startTime, duration),
    map { map } { }

std::vector<int> ShotVoting::decodeVote(std::string votestr, char separator){
    std::vector<int> cords = {0, 0};
    int sep = votestr.find(separator);
    cords[0] = atoi(votestr.substr(0, sep).c_str());
    cords[1] = atoi(votestr.substr(sep + 1).c_str());

    return cords;
}

bool ShotVoting::validateShot(int x, int y){
    if(map->getStatus(x, y) != FieldStatus::CLEAR) return false;
    return true;
}

bool ShotVoting::validate(Vote& vote){
    if(!Voting::validate(vote)) return false;

    std::vector<int> cords = decodeVote(vote.getVote(), '|');
    if(!validateShot(cords[0], cords[1])) return false;
    
    return true;
}

std::vector<int> ShotVoting::getDecodedResult(){
    return decodeVote(Voting::getResult(), '|');
}