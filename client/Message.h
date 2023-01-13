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
};

class Message{
private:
    MessageType type;
    std::string gameId;
    std::string playerId;
    std::string content;

public:
    static Message decode(std::string message);
    static Message decode(std::string message, char separator);

    Message();
    Message(MessageType type, std::string gameId, std::string playerId, std::string content);
    Message(MessageType type, std::string content);

    std::string encode();
    std::string encode(char separator);

    MessageType getType();
    std::string getGameId();
    std::string getPlayerId();
    std::string getContent();

    int getLength();
};