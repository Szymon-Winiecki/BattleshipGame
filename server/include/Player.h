#pragma once

#include <string>
#include <sstream>

#include "./Client.h"
#include "./Game.h"
#include "./Vote.h"

class Game;

class Player{
    private:
        static long nextId;
        static std::string generateId();

        Client* client;
        std::string playerId;
        Game* game;
        int teamid;
    public:
        bool operator==(const Player &rhs);

        Player();
        std::string getId() const;
        void setClient(Client* client);
        void setGame(Game* game);
        void setTeamId(int team);

        Game* getGame() const;
        int getTeamId() const;

        bool vote(std::string votingId, std::string vote);
};