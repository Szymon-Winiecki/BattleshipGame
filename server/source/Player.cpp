#include "../include/Player.h"


long Player::nextId = 1;

std::string Player::generateId(){
    std::ostringstream id;
    id << "player" << nextId++;
    return id.str();
}

bool Player::operator==(const Player &rhs){
    return this->getId() == rhs.getId();
}

Player::Player() : playerId{ generateId() }, client{ nullptr }, game { nullptr } {};


std::string Player::getId() const{
    return playerId;
}

void Player::setClient(Client* client){
    this->client = client;
}

void Player::setGame(Game* game){
    this->game = game;
}

Game* Player::getGame() const{
    return this->game;
}

void Player::setTeamId(int team){
    this->teamid = team;
}

int Player::getTeamId() const{
    return this->teamid;
}

void Player::sendMessage(Message &message){
    if(this->client == nullptr) return;
    this->client->writem(message);
}

bool Player::vote(std::string votingId, std::string vote){
    Vote v = Vote(this->getId(), game->getId(), votingId, vote);
    return game->vote(v);
}