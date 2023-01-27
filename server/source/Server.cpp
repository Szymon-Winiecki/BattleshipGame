#include <iostream>

#include "../include/Server.h"

Server* Server::server = nullptr;

Server* Server::getServer(){
    return Server::server;
}


Server::Server(){
    if(Server::server != nullptr){
        Server::server->stop();
    }    
    Server::server = this;
}

void Server::handleEpollEvent(uint32_t events) {
    if(events & EPOLLIN){

        sockaddr_in clientAddr{};
        socklen_t clientAddrSize = sizeof(clientAddr);
        
        auto clientFd = accept(getServFd(), (sockaddr*) &clientAddr, &clientAddrSize);
        if(clientFd == -1) error(1, errno, "accept failed");
        
        printf("new connection from: %s:%hu (fd: %d)\n", inet_ntoa(clientAddr.sin_addr), ntohs(clientAddr.sin_port), clientFd);

        addClient(new Client(clientFd, this));
        
    }
    if(events & ~EPOLLIN){
        error(0, errno, "Event %x on server socket", events);
        Server::ctrl_c(SIGINT);
    }
}


/*FUNKCJA GLOWNA SERWERA*/
void Server::run(int argc, char ** argv){
    if(argc != 2) error(1, 0, "Need 1 arg (port)");
    auto port = readPort(argv[1]);
    
    servFd = socket(AF_INET, SOCK_STREAM, 0);
    if(servFd == -1) error(1, errno, "socket failed");
    
    signal(SIGINT, ctrl_c);
    signal(SIGPIPE, SIG_IGN);
    
    setReuseAddr(servFd);
    
    sockaddr_in serverAddr{.sin_family=AF_INET, .sin_port=htons((short)port), .sin_addr={INADDR_ANY}};
    int res = bind(servFd, (sockaddr*) &serverAddr, sizeof(serverAddr));
    if(res) error(1, errno, "bind failed");
    
    res = listen(servFd, 1);
    if(res) error(1, errno, "listen failed");

    epollFd = epoll_create1(0);
    
    epoll_event ee {EPOLLIN, {.ptr=this}};
    epoll_ctl(epollFd, EPOLL_CTL_ADD, servFd, &ee);
    
    while(true){
        if(-1 == epoll_wait(epollFd, &ee, 1, -1)) {
            error(0,errno,"epoll_wait failed");
            ctrl_c(SIGINT);
        }
        if((Server*)ee.data.ptr == this){
            ((Server*)ee.data.ptr)->handleEpollEvent(ee.events);
        }
        ((Client*)ee.data.ptr)->handleEvent(ee.events);
    }
}

void Server::stop(){
    Message message = Message(SERVERERROR);
    for(Client * client : clients){
        client->writem(message);
        delete client;
    }
    printf("Closing server\n");
    close(servFd);
    close(epollFd);
}

void Server::addClient(Client* client){
    clients.insert(client);
}
void Server::removeClient(Client* client){
    clients.erase(client);
}

void Server::addGame(Game* game){
    games.push_back(game);
}

void Server::removeGame(Game* game){
    games.remove(game);
}

Game* Server::getGame(std::string id){
    for (auto const game : games) {
        if(game->getId() == id){
            return game;
        }
    }
    return nullptr;
}

/*ROZNE DODATKOWE FUNKCJE*/
uint16_t Server::readPort(char * txt){
    char * ptr;
    auto port = strtol(txt, &ptr, 10);
    if(*ptr!=0 || port<1 || (port>((1<<16)-1))) error(1,0,"illegal argument %s", txt);
    return port;
}

void Server::setReuseAddr(int sock){
    const int one = 1;
    int res = setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &one, sizeof(one));
    if(res) error(1,errno, "setsockopt failed");
}

int Server::getServFd(){
    return servFd;
}
int Server::getEpollFd(){
    return epollFd;
}

void Server::ctrl_c(int){
    Server::server->stop();
    exit(0);
}


