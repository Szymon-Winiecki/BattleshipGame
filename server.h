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


void ctrl_c(int);

void sendToAllBut(int fd, char * buffer, int count);
void sendToAll(char * buffer, int count);

uint16_t readPort(char * txt);

void setReuseAddr(int sock);

class Client;

int servFd;
int epollFd;

std::unordered_set<Client*> clients;

struct Handler {
    virtual ~Handler(){}
    virtual void handleEvent(uint32_t events) = 0;
};