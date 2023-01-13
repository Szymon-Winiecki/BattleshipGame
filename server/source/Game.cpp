#include "../include/Game.h"

int Game::nextId = 1;
std::string Game::generateId(){
    std::ostringstream id;
    id << "game" << nextId++;
    return id.str();
}

Game::Game() :
    gameId{ generateId() },
    maxPlayers{ 2 } { }

void Game::open(){

}

void Game::start(){

}

Player* Game::join(int team){
    if(teams[0].size() + teams[1].size() >= maxPlayers){
        return NULL;
    }
    assertTeam(team);
    Player* newPlayer = new Player();
    newPlayer->setTeamId(team);
    teams[team].push_front(newPlayer);
    return newPlayer;
}

std::string Game::getId(){
    return gameId;
}

std::list<Player*>* Game::getTeam(int team){
    assertTeam(team);
    return &teams[team];
}

void Game::assertTeam(int team){
    if(team < 0 || team > 1){
        throw new std::out_of_range("the \'team\' argument can only take the value of 0 or 1");
    }
}

Voting* Game::getVoting(std::string votingId){
    if(activeVotings.find(votingId) == activeVotings.end()){
        return NULL;
    }
    return activeVotings[votingId];
}

void Game::leave(int team, Player* player){
    teams[team].remove(player);
}

void Game::changeTeam(int team, Player* player){
    this->leave(abs(team-1),player);
    player->setTeamId(team);
    teams[team].push_front(player);
}