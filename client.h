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
#include <iostream>

ssize_t readData(int fd, char * buffer, ssize_t buffsize);

void writeData(int fd, char * buffer, ssize_t count);