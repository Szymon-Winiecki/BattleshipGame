#include "../include/Client.h"
#include "../include/Server.h"
#include "../include/Player.h"

Client::Client(int fd, Server* server) : _fd(fd), server{server}, player{nullptr} {
        epoll_event ee {EPOLLIN|EPOLLRDHUP, {.ptr=this}};
        epoll_ctl(server->getEpollFd(), EPOLL_CTL_ADD, _fd, &ee);

        Message message = Message(MessageType::INFO,"Witamy na serwerze!");
        this->writem(message);
        Message message1 = Message(MessageType::INFO,"Druga testowa wiadomosc!");
        this->writem(message1);

    }

Client::~Client(){
    epoll_ctl(server->getEpollFd(), EPOLL_CTL_DEL, _fd, nullptr);
    shutdown(_fd, SHUT_RDWR);
    close(_fd);
}

int Client::fd() {
    return _fd;
}

Player* Client::getPlayer(){
    return this->player;
}

void Client::handleEvent(uint32_t events){
    if(events & EPOLLIN) {
        char buffer[256]{};
        char buffd[10]{};
        sprintf(buffd,"%d: ", _fd); //todo: wyslac fd jako wiadomosc
        ssize_t count = read(_fd, buffer, 256);
        int i{0};
        while(count>i){ //ret - liczba odczytanych znakow przez funkcje read(), i - liczba znakow jakie juz zapisalismy
            std::string s {""};
            if(buffer[i]=='{'){ //poczatek wiadomosci
                i++;
                while(buffer[i]!='}'){ //koniec wiadomosci
                    if(i>=256){ //jezeli dotarlismy do konca rozmiaru bufora a nadal nie znalezlismy '{'
                        i=0;
                        count = read(_fd, buffer, 256); //czytamy znowu
                        if(buffer[i]=='{') //to chyba useless tu jednak 
                            i++;
                    }
                    s.push_back(buffer[i]); //dodajemy znak do stringa
                    i++; //kolejny znak
                }
            }
            i++; //usuwamy '}'
             
            Message message = Message::decode(s);
            switch(message.getType()){ 
                case CREATE:{
                    this->createGame();
                break;}
                case JOIN:{
                    this->joinGame(message.getObjectId()); 
                break;}
                case LEAVE:{
                    this->leaveGame();
                break;}
                case CHANGETEAM:{
                    if(this->getPlayer()->getTeamId() == atoi(message.getParam1().c_str())){
                        Message errmessage = Message(MessageType::ERROR,"Juz jestes w tej druzynie\n");
                        this->writem(errmessage);
                        break;
                    }
                    this->getPlayer()->getGame()->changeTeam(atoi(message.getParam1().c_str()),this->getPlayer());
                    Message m = Message(MessageType::CHANGETEAM, std::to_string(this->getPlayer()->getTeamId()));
                    this->writem(m);
                break;}
                case GETMAP:{
                    int team = atoi(message.getParam1().c_str());
                    if(getPlayer() == NULL || getPlayer()->getGame() == NULL){
                        Message message = Message(MessageType::ERROR,"Aby pobrac mape musisz byc w grze\n");
                        this->writem(message);
                        break;
                    }
                    if(team < 0 || team > 1){
                        Message message = Message(MessageType::ERROR,"Sa tylko dwie druzyny: 0 i 1\n");
                        this->writem(message);
                        break;
                    }
                    bool showShips = false;
                    if(getPlayer()->getTeamId() == team) showShips = true;
                    Message message = Message(MessageType::GETMAP, std::to_string(team), getPlayer()->getGame()->getSerializedMap(team, showShips), "");
                    this->writem(message);
                break;}
                case SHOWTEAMS:{
                    this->showPlayers();
                break;}
                case VOTE:
                    std::cout << message.encode() << std::endl;
                    this->getPlayer()->vote(message.getObjectId(), message.getParam1());
                break;
                case GETROUND:{
                    Message m = getPlayer()->getGame()->currentRoundInfo();
                    getPlayer()->sendMessage(m);
                break;}
                case STARTGAME:
                    if(getPlayer() != getPlayer()->getGame()->getOwner()){
                        Message message = Message(MessageType::ERROR,"Tylko wlasciciel moze rozpoczac gre\n");
                        this->writem(message);
                        break;
                    }
                    if(this->getPlayer()->getGame()->getTeam(0)->size()<1 || this->getPlayer()->getGame()->getTeam(1)->size()<1){
                        Message message = Message(MessageType::ERROR,"W obu druzynach musi byc przynajmniej jeden gracz!\n");
                        this->writem(message);
                        break;
                    }
                    getPlayer()->getGame()->start();
                break;
                default:
                    events |= EPOLLERR;
                break;

                
            }
        }
    }
    if(events & ~EPOLLIN){
        remove();
    }
}


void Client::writem(Message &message){
    int count = message.getLength();
    if(count != ::write(_fd, message.encode().c_str(), count)){
        remove();
    }  
}

void Client::readm(uint32_t events){

}

void Client::remove() {
    printf("==Usunieto klienta o FD: %d\n", _fd);
    if (this->player != nullptr && this->player->getGame() != nullptr) {
        leaveGame();
    }
    server->removeClient(this);
    delete this;
}

void Client::setPlayer(Player* player){
    this->player=player;
}

void Client::createGame(){ 
    if(this->getPlayer() != nullptr){
        Message message = Message(MessageType::ERROR,"Wyjdz z biezacej gry, aby stworzyc nowa\n");
        this->writem(message);
        return;
    }

    Game* newGame = new Game();
    server->addGame(newGame);
    Player *newPlayer = newGame->join(0);
    newPlayer->setClient(this);
    newPlayer->setGame(newGame);
    this->setPlayer(newPlayer);
    newGame->setOwner(newPlayer);
    Message message = Message(MessageType::CREATE,newGame->getId(),player->getId(),std::to_string(player->getTeamId()));
    this->writem(message);

}

void Client::joinGame(std::string id){
    if(this->getPlayer() != nullptr){
        Message message = Message(MessageType::ERROR,"Wyjdz z biezacej gry, aby dolaczyc do innej\n");
        this->writem(message);
        return;
    }
    Game* game = server->getGame(id);

    if(game == nullptr){
        Message message = Message(MessageType::ERROR,"Nie ma gry o takim id\n");
        this->writem(message);
        return;
    }

    if(game->isStarted()){
        Message message = Message(MessageType::ERROR,"Nie mozna dolaczyc, gra sie juz rozpoczela.\n");
        this->writem(message);
        return;
    }

    Player *newPlayer = game->join(0);
    if(newPlayer==NULL){
        Message message = Message(MessageType::ERROR,"Lobby jest pelne\n");
        this->writem(message);
        return;
    }
    newPlayer->setClient(this);
    newPlayer->setGame(game);
    this->setPlayer(newPlayer);
    //message(typ,id gry,id gracza,nr druzyny)
    Message message = Message(MessageType::JOIN, game->getId(), newPlayer->getId(), std::to_string(newPlayer->getTeamId()));
    this->writem(message);
    this->showPlayers();
}

void Client::leaveGame(){ 

    if(this->player == nullptr){
        Message message = Message(MessageType::ERROR,"Nie jestes w zadnej grze\n");
        this->writem(message);
        return;
    }
    if(this->player->getGame() != nullptr){
        Game* game = this->getPlayer()->getGame();

        game->leave(player->getTeamId(), player);

        if(game->getNumberOfPlayers() == 0){
            std::cout<<"--Usunieto gre o ID: "<<game->getId()<<std::endl;
            server->removeGame(game);
            game = nullptr;
        }

        if(game != nullptr && game->getTeam(player->getTeamId())->size()==0 && game->isStarted()){ //jezeli brak graczy w jednej druzynie
            game->endGame(1-player->getTeamId());
        }

        if(game != nullptr && !game->isFinished() && game->getOwner() == player){
            game->changeOwner();
        }
    }
    this->player = nullptr;
    
    Message message = Message(MessageType::LEAVE,"Udalo sie wyjsc\n");
    this->writem(message);
}



void Client::showPlayers(){
    if(this->getPlayer()==nullptr){
        Message message = Message(MessageType::ERROR,"Nie jestes w zadnej grze\n");
        this->writem(message);
        return;
    }
   
    Message message1 = this->player->getGame()->currentTeamInfo(0);
    this->writem(message1);

    Message message2 = this->player->getGame()->currentTeamInfo(1);
    this->writem(message2);
}