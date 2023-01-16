#include "../include/Message.h"

Message::Message() : Message(MessageType::UNKNOWN, "", "", ""){};

Message::Message(MessageType type, std::string gameId, std::string param1, std::string param2) :
    type{ type },
    objectId{ gameId },
    param1{ param1 },
    param2{ param2 } { }

Message::Message(MessageType type, std::string param1) :
    type{ type },
    objectId{ "" },
    param1{ param1 },
    param2{ "" } { }

Message::Message(MessageType type) :
    type{ type },
    objectId{ "" },
    param1{ "" },
    param2{ "" } { }

Message Message::decode(std::string message){
    return Message::decode(message, '|');
}

Message Message::decode(std::string message, char separator){
    Message decoded;
    std::istringstream encoded(message);
    
    std::string typestr;
    std::getline(encoded, typestr, separator);
    decoded.type = (MessageType) atoi(typestr.c_str());

    std::getline(encoded, decoded.objectId, separator);
    std::getline(encoded, decoded.param1, separator);
    std::getline(encoded, decoded.param2);
    
    return decoded;
}

std::string Message::encode(){
    return this->encode('|');
}

std::string Message::encode(char separator){
    std::stringstream encoded;
    //dodajemy nawiasy przy zakodowaniu, bo latwiej, do odkodowania nie trzeba bo latwiej usunac przy odczytywaniu bufora
    encoded << '{' << this->type << separator << this->objectId << separator << this->param1 << separator << this->param2 << '}';
    
    //encoded << this->type << separator << this->objectId << separator << this->param1 << separator << this->param2; //stare
    return encoded.str();
}

MessageType Message::getType(){
    return this->type;
}
std::string Message::getObjectId(){
    return this->objectId;
}
std::string Message::getParam1(){
    return this->param1;
}
std::string Message::getParam2(){
    return this->param2;
}

int Message::getLength(){
    return this->encode().size();
}