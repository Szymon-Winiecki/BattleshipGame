#include "../include/Voting.h"

long Voting::nextId = 1;

std::string Voting::generateId(){
    std::ostringstream id;
    id << "voting" << nextId++;
    return id.str();
}

Voting::Voting(std::string gameId, std::list<Player>* allowedPlayers, long duration) :
    Voting(gameId, allowedPlayers, std::chrono::duration_cast< std::chrono::milliseconds >(std::chrono::system_clock::now().time_since_epoch()).count(), duration) { }

Voting::Voting(std::string gameId, std::list<Player>* allowedPlayers, long startTime, long duration) :
    gameId{ gameId },
    allowedPlayers{ allowedPlayers },
    startTime{ startTime },
    duration{ duration } { 
    
    this->votingId = generateId();
}

bool Voting::validateVoting(std::string votingId){
    if(this->votingId == votingId) return true;
    return false;
}

bool Voting::validateGame(std::string gameId){
    if(this->gameId == gameId) return true;
    return false;
}

bool Voting::validateTime(long time){
    if(time >= this->startTime && time <= this->startTime + this->duration) return true;
    return false;
}

bool Voting::validatePlayer(std::string playerId){
    for (Player player : *allowedPlayers)
    {
        if(player.getId() == playerId) return true;
    }
    return false;
}

std::string Voting::getVotingId(){
    return votingId;
}

bool Voting::validate(Vote& vote){
    if(!this->validateVoting(vote.getVotingId())) return false;
    if(!this->validateGame(vote.getGameId())) return false;
    if(!this->validateTime(vote.getTime())) return false;
    if(!this->validatePlayer(vote.getPlayerId())) return false;
    return true;
}