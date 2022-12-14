#pragma once
#include "./Client.h"
#include "./Player.h"
#include "./Game.h"
#include "./Vote.h"
#include "./Voting.h"
#include "./Message.h"
#include "./Handler.h"


class Client : Handler{
    int _fd;
    Player* player;
    public:
        Client(int fd);
        ~Client();

        int fd();
        Player* getPlayer();

        void write(char * buffer, int count); 
        void remove();
        void handleEvent(uint32_t events);
        
        void createGame();
        void joinGame(std::string id);

        void setPlayer(Player* player);
        void showPlayers();
};