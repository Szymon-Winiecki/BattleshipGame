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
#include "./Player.h"
#include "./Game.h"
#include "./Vote.h"
#include "./Voting.h"
#include "./Message.h"
#include "./Handler.h"
#include "./Client.h"

#include "./Message.h"
#include <iostream>

void ctrl_c(int);

void sendToAllBut(int fd, char * buffer, int count);
void sendToAll(char * buffer, int count);

uint16_t readPort(char * txt);

void setReuseAddr(int sock);


void run(int argc, char ** argv);