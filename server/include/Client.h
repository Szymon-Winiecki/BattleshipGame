#pragma once

#include <cstdlib>
#include <cstdio>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <errno.h>
#include <error.h>
#include <netdb.h>
#include <sys/epoll.h>
#include <unordered_set>
#include <signal.h>
#include <string.h>

#include "./Game.h"
#include "./Message.h"

class Server;
class Player;

class Client{
    int _fd;
    Server* server;
    Player* player;
    public:
        Client(int fd, Server* server);
        ~Client();

        int fd();
        Player* getPlayer();

        void writem(Message &message);
        void remove();
        void handleEvent(uint32_t events);
        void readm(uint32_t events);
        
        void createGame();
        void joinGame(std::string id);
        void leaveGame();
        void changeTeam();
        void getMap(int team);
        void startGame(int roundTime);

        void setPlayer(Player* player);
        void showPlayers();

};