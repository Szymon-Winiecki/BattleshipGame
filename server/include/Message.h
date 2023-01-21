#pragma once

#include <string>
#include <sstream>
#include <stdio.h>

enum MessageType{
    UNKNOWN = 0,
    INFO = 1,
    ERROR = 2,
    VOTE = 3,
    JOIN = 4,
    CREATE = 5,
    PLAYERJOINED = 6,
    PLAYERLEFT = 7,
    SHOWTEAMS = 8,
    LEAVE = 9,
    CHANGETEAM = 10,
    GETMAP = 11,
    SERVERERROR = 12,
    PLAYERERROR = 13,
    SENDFD = 14,
    VOTERESULT = 15,
    NEXTROUND = 16
};

class Message{
private:
    MessageType type;
    std::string objectId;
    std::string param1;
    std::string param2;

public:
    static Message decode(std::string message);
    static Message decode(std::string message, char separator);

    Message();
    Message(MessageType type, std::string objectId, std::string param1, std::string param2);
    Message(MessageType type, std::string param1);
    Message(MessageType type);

    std::string encode();
    std::string encode(char separator);

    MessageType getType();
    std::string getObjectId();
    std::string getParam1();
    std::string getParam2();

    int getLength();
};