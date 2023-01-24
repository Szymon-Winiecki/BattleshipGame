#include "../include/Voting.h"
#include "./Player.h"

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

bool Voting::validateIfVotedOnce(std::string playerId){
    if(playersThatVoted.find(playerId) == playersThatVoted.end()){
        return true;
    }
    else{
        return false;
    }
}

std::string Voting::getVotingId(){
    return votingId;
}

bool Voting::validate(Vote& vote){
    if(!validateVoting(vote.getVotingId())) return false;
    if(!validateGame(vote.getGameId())) return false;
    if(!validateTime(vote.getTime())) return false;
    if(!validatePlayer(vote.getPlayerId())) return false;
    if(!validateIfVotedOnce(vote.getPlayerId())) return false;
    return true;
}

bool Voting::vote(Vote& vote){

    if(!validate(vote)) return false;

    if(votes.find(vote.getVote()) == votes.end()){
        votes.insert({vote.getVote(), 1});
    }
    else{
        ++votes[vote.getVote()];
    }
    return true;
}

std::string Voting::getRanking(){
    std::stringstream ranking;
    for(auto can : votes){
        ranking  << can.first << ": " << can.second << '\n';
    }
    return ranking.str();
}

std::string Voting::getResult(){
    int max = -1;
    std::string result = "";
    for(auto can : votes){
        if(can.second > max){
            max = can.second;
            result = can.first;
        }
    }

    return result;
}

long Voting::getEndTime(){
    return startTime + duration;
}