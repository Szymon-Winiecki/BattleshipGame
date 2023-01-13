#include "./Message.h"

Message::Message() : Message(MessageType::UNKNOWN, "", "", ""){};

Message::Message(MessageType type, std::string gameId, std::string playerId, std::string content) :
    type{ type },
    gameId{ gameId },
    playerId{ playerId },
    content{ content } { }

Message::Message(MessageType type, std::string content) :
    type{ type },
    gameId{ },
    playerId{ },
    content{ content } { }

Message Message::decode(std::string message){
    return Message::decode(message, '|');
}

Message Message::decode(std::string message, char separator){
    Message decoded;
    std::istringstream encoded(message);
    
    std::string typestr;
    std::getline(encoded, typestr, separator);
    decoded.type = (MessageType) atoi(typestr.c_str());

    std::getline(encoded, decoded.gameId, separator);
    std::getline(encoded, decoded.playerId, separator);
    std::getline(encoded, decoded.content);
    
    return decoded;
}

std::string Message::encode(){
    return this->encode('|');
}

std::string Message::encode(char separator){
    std::stringstream encoded;
    encoded << this->type << separator << this->gameId << separator << this->playerId << separator << this->content;
    return encoded.str();
}

MessageType Message::getType(){
    return this->type;
}
std::string Message::getGameId(){
    return this->gameId;
}
std::string Message::getPlayerId(){
    return this->playerId;
}
std::string Message::getContent(){
    return this->content;
}

int Message::getLength(){
    return this->encode().size();
}