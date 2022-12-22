#include "../include/Player.h"

long Player::nextId = 1;

std::string Player::generateId(){
    std::ostringstream id;
    id << "player" << nextId++;
    return id.str();
}

Player::Player() : playerId{ generateId() } {};

std::string Player::getId(){
    return playerId;
}

void Player::setClient(Client* client){
    this->client = client;
}

void Player::setGame(Game* game){
    this->game = game;
}

bool Player::vote(std::string votingId, std::string vote){
    Vote vote = Vote(this->getId(), game->getId(), votingId, vote);
    //todo
}