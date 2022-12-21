#include "server.h"


class Client : public Handler {
    int _fd;
    char id[20];
public:
    Client(int fd) : _fd(fd) {
        epoll_event ee {EPOLLIN|EPOLLRDHUP, {.ptr=this}};
        epoll_ctl(epollFd, EPOLL_CTL_ADD, _fd, &ee);

        char buf[256];
        sprintf(buf,"Witamy na serwerze!\nTwoje unikalne id to: %d\n",_fd);
        write(buf,strlen(buf));

        char buf1[256]; 
        sprintf(buf1,"Gracz %d dolaczyl do gry\n",_fd);
        sendToAllBut(_fd, buf1, strlen(buf1));
    }
    virtual ~Client(){
        epoll_ctl(epollFd, EPOLL_CTL_DEL, _fd, nullptr);
        shutdown(_fd, SHUT_RDWR);
        close(_fd);
    }
    int fd() const {return _fd;}
    virtual void handleEvent(uint32_t events) override {
        if(events & EPOLLIN) {
            char buffer[256];
            char buffd[10];
            sprintf(buffd,"%d: ", _fd);
            ssize_t count = read(_fd, buffer, 256);
            if(count > 0){
                sendToAllBut(_fd, buffd, strlen(buffd));
                sendToAllBut(_fd, buffer, count);
            }
            else
                events |= EPOLLERR;
        }
        if(events & ~EPOLLIN){
            remove();
        }
    }

    void write(char * buffer, int count){
        if(count != ::write(_fd, buffer, count))
            remove();
        
    }
    void remove() {
        printf("removing %d\n", _fd);
        char buf[255];
        sprintf(buf,"Gracz %d opuscil gre.\n",_fd);
        sendToAllBut(_fd,buf,strlen(buf));
        clients.erase(this);
        delete this;
    }

};

class : Handler {
    public:
    virtual void handleEvent(uint32_t events) override {
        if(events & EPOLLIN){

            sockaddr_in clientAddr{};
            socklen_t clientAddrSize = sizeof(clientAddr);
            
            auto clientFd = accept(servFd, (sockaddr*) &clientAddr, &clientAddrSize);
            if(clientFd == -1) error(1, errno, "accept failed");
            
            printf("new connection from: %s:%hu (fd: %d)\n", inet_ntoa(clientAddr.sin_addr), ntohs(clientAddr.sin_port), clientFd);

            clients.insert(new Client(clientFd));
          
        }
        if(events & ~EPOLLIN){
            error(0, errno, "Event %x on server socket", events);
            ctrl_c(SIGINT);
        }
    }
} servHandler;


int main(int argc, char ** argv){
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
    
    epoll_event ee {EPOLLIN, {.ptr=&servHandler}};
    epoll_ctl(epollFd, EPOLL_CTL_ADD, servFd, &ee);
    
    while(true){
        if(-1 == epoll_wait(epollFd, &ee, 1, -1)) {
            error(0,errno,"epoll_wait failed");
            ctrl_c(SIGINT);
        }
        ((Handler*)ee.data.ptr)->handleEvent(ee.events);
    }
}

uint16_t readPort(char * txt){
    char * ptr;
    auto port = strtol(txt, &ptr, 10);
    if(*ptr!=0 || port<1 || (port>((1<<16)-1))) error(1,0,"illegal argument %s", txt);
    return port;
}

void setReuseAddr(int sock){
    const int one = 1;
    int res = setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &one, sizeof(one));
    if(res) error(1,errno, "setsockopt failed");
}

void ctrl_c(int){
    char buf[] = "0"; //tymczasowe informowanie klientow o zamknieciu serwera
    for(Client * client : clients){
        client->write(buf,2);
        delete client;
    }
    printf("Closing server\n");
    close(servFd);
    exit(0);
}

void sendToAllBut(int fd, char * buffer, int count){
    auto it = clients.begin();
    while(it!=clients.end()){
        Client * client = *it;
        it++;
        if(client->fd()!=fd)
            client->write(buffer, count);
    }
}

void sendToAll(char * buffer, int count){
    auto it = clients.begin();
    while(it!=clients.end()){
        Client * client = *it;
        it++;
        client->write(buffer, count);
    }
}
