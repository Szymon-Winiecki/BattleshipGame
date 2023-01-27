#pragma once

#include <iostream>
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

#include "./Player.h"
#include "./Game.h"
#include "./Client.h"

class Client;
class Game;

class Server{
private:
    //singleton
    static Server* server;

    int servFd;
    int epollFd;

    std::unordered_set<Client*> clients;
    std::list<Game*> games;

    uint16_t readPort(char * txt);
    void setReuseAddr(int sock);
public:
    static Server* getServer();

    Server();

    void handleEpollEvent(uint32_t events);

    void run(int argc, char ** argv); //przerobic
    void stop();

    void addClient(Client* client);
    void removeClient(Client* client);

    void addGame(Game* game);
    void removeGame(Game* game);
    Game* getGame(std::string id);

    int getServFd();
    int getEpollFd();

    static void ctrl_c(int);
};