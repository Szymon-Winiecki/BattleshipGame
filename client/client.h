#include <stdio.h>
#include <unistd.h>
#include <sys/epoll.h>
#include <cstdlib>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <errno.h>
#include <error.h>
#include <netdb.h>
#include <sys/epoll.h>
#include <poll.h> 
#include <thread>
#include <list>
#include <iostream>
#include "./Message.h"

ssize_t readData(int fd, char * buffer, ssize_t buffsize); //do usuniecia

void writeData(int fd, char * buffer, ssize_t count); //do usuniecia

void writeDatam(int fd, Message* message);

ssize_t readDatarec(int fd, char * buffer, ssize_t buffsize);

void writeDatatoConsole(int fd, std::string buffer, ssize_t count);


//mozliwe ze klasa by sie tu przydala do zapisywania danych o grze, ale na razie nieuzywana
/*class Client{
    int fd; //fd from server
    std::string playerId;
    std::string gameId;
    int team;
    std::list<std::string> teams[2];
    public:
        Client();

        //void send(int fd, Message* message);
        //void receive(int fd, char * buffer, ssize_t buffsize);
        //void showMessage(int fd, std::string buffer, ssize_t count);

        void setFd(int fd);
        void setPlayerId(std::string id);
        void setTeam(int team);
        void addPlayerToTeam(std::string playerid,int team);

};*/