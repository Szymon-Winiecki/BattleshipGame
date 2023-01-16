#include "../include/server.h"
#include <iostream>

int servFd;
int epollFd;

std::unordered_set<Client*> clients;

std::list<Game*> games;

/*HANDLER DO OBSLUGI NOWEGO POLACZENIA*/

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


/*FUNKCJE KLASY KLIENTA NA SERWERZE (POZNIEJ PEWNIE PRZENIESIONE CO CLIENT.CPP)*/
Client::Client(int fd) : _fd(fd), player{nullptr} {
        epoll_event ee {EPOLLIN|EPOLLRDHUP, {.ptr=this}};
        epoll_ctl(epollFd, EPOLL_CTL_ADD, _fd, &ee);

        Message* message = new Message(MessageType::INFO,"Witamy na serwerze!");
        this->writem(message);
        Message* message1 = new Message(MessageType::INFO,"Druga testowa wiadomosc!");
        this->writem(message1);
    }

Client::~Client(){
    epoll_ctl(epollFd, EPOLL_CTL_DEL, _fd, nullptr);
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
        sprintf(buffd,"%d: ", _fd);
        ssize_t count = read(_fd, buffer, 256);
        if(count > 0){ 
            std::string s {buffer};
            Message message = Message::decode(s);
            switch(message.getType()){ 
                case CREATE:
                    this->createGame();
                    this->showPlayers();
                break;
                case JOIN:
                    std::cout<<message.getObjectId()<<std::endl;
                    this->joinGame(message.getObjectId());
                    this->showPlayers();
                break;
                case LEAVE:
                    this->leaveGame();
                break;
                case CHANGETEAM:
                    if(this->getPlayer()->getTeamId() == atoi(message.getParam1().c_str())){
                        Message* message = new Message(MessageType::ERROR,"Juz jestes w tej druzynie\n");
                        this->writem(message);
                        break;
                    }
                    this->getPlayer()->getGame()->changeTeam(atoi(message.getParam1().c_str()),this->getPlayer());
                    this->showPlayers();
                break;
                case GETMAP:{
                    int team = atoi(message.getParam1().c_str());
                    if(getPlayer() == NULL || getPlayer()->getGame() == NULL){
                        Message* message = new Message(MessageType::ERROR,"Aby pobrac mape musisz byc w grze\n");
                        this->writem(message);
                        break;
                    }
                    if(team < 0 || team > 1){
                        Message* message = new Message(MessageType::ERROR,"Sa tylko dwie druzyny: 0 i 1\n");
                        this->writem(message);
                        break;
                    }
                    bool showShips = false;
                    if(getPlayer()->getTeamId() == team) showShips = true;
                    Message* message = new Message(MessageType::GETMAP, getPlayer()->getGame()->getSerializedMap(team, showShips));
                    this->writem(message);
                break;}
                case SHOWTEAMS:
                    this->showPlayers();
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

void Client::write(char * buffer, int count){
    if(count != ::write(_fd, buffer, count)){
        remove();
    }
}

void Client::writem(Message* message){
    int count = message->getLength();
    if(count != ::write(_fd, message->encode().c_str(), count)){
        remove();
    }  
}

void Client::readm(uint32_t events){

}

void Client::remove() {
    printf("removing %d\n", _fd);
    char buf[255];
    sprintf(buf,"Gracz %d opuscil gre.\n",_fd);
    //sendToAllBut(_fd,buf,strlen(buf));
    clients.erase(this);
    delete this;
}




void Client::setPlayer(Player* player){
    this->player=player;
}



void Client::createGame(){ 
    if(this->getPlayer() != nullptr){
        Message* message = new Message(MessageType::ERROR,"Wyjdz z biezacej gry, aby stworzyc nowa\n");
        this->writem(message);
        return;
    }
    Game* newGame = new Game();
    games.push_back(newGame);
    Player *player = newGame->join(0);
    player->setClient(this);
    player->setGame(newGame);
    this->setPlayer(player);
    Message* message = new Message(MessageType::CREATE,newGame->getId(),player->getId(),"Udalo sie stworzyc\n");
    this->writem(message);

}

void Client::joinGame(std::string id){
    if(this->getPlayer() != nullptr){
        Message* message = new Message(MessageType::ERROR,"Wyjdz z biezacej gry, aby dolaczyc do innej\n");
        this->writem(message);
        return;
    }
    for (auto const i : games) {
        if(i->getId() == id){
            Player *player = i->join(0);
            if(player==NULL){
                Message* message = new Message(MessageType::ERROR,"Lobby jest pelne\n");
                this->writem(message);
                return;
            }
            player->setClient(this);
            player->setGame(i);
            this->setPlayer(player);
            Message* message = new Message(MessageType::CREATE,i->getId(),player->getId(),"Udalo sie dolaczyc\n");
            this->writem(message);
            return;
        }
    }
    Message* message = new Message(MessageType::ERROR,"Nie ma gry o takim id\n");
    this->writem(message);
}

void Client::leaveGame(){ 
    if(this->player == nullptr){
        Message* message = new Message(MessageType::ERROR,"Nie jestes w zadnej grze\n");
        this->writem(message);
        return;
    }
    this->getPlayer()->getGame()->leave(this->getPlayer()->getTeamId(),this->getPlayer());
    this->player = nullptr;
    Message* message = new Message(MessageType::LEAVE,"Udalo sie wyjsc\n");
    this->writem(message);

    //Message* message1 = new Message(MessageType::PLAYERLEFT,this->getPlayer()->getId());
    //sendToAllButInGame(this->fd(),message1); //do zrobienia - wazne

}



void Client::showPlayers(){ //do poprawy czy to kiedys poprawnie zadziala?
    if(this->getPlayer()==nullptr){
        Message* message = new Message(MessageType::ERROR,"Nie jestes w zadnej grze\n");
        this->writem(message);
        return;
    }
    std::string s1{""};
    if(this->getPlayer()->getGame()->getTeam(0)->size() > 0){
        for (auto i: *this->getPlayer()->getGame()->getTeam(0)) {
            s1+=i.getId();
            s1+=" ";
        }
    }
    Message* message1 = new Message(MessageType::SHOWTEAMS,this->getPlayer()->getGame()->getId(),"Team 0:",s1); 
    this->writem(message1);

    std::string s2{""};
    if(this->getPlayer()->getGame()->getTeam(1)->size() > 0){
        for (auto i: *this->getPlayer()->getGame()->getTeam(1)) {
            s2+=i.getId();
            s2+=" ";
        }
    }
    //jak s2 zostaje puste "" to klient przy odbieraniu wypisuje '}' przy buforsize 20
    Message* message2 = new Message(MessageType::SHOWTEAMS,this->getPlayer()->getGame()->getId(),"Team 1:",s2); 
    this->writem(message2);
}




/*FUNKCJA GLOWNA SERWERA*/
void run(int argc, char ** argv){
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

/*ROZNE DODATKOWE FUNKCJE*/
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
    //zrobic tu informowanie klientow o zamknieciu serwera ASAP
    for(Client * client : clients){
        delete client;
    }
    printf("Closing server\n");
    close(servFd);
    exit(0);
}

void sendToAllBut(int fd, char * buffer, int count){ //do usuniecia
    auto it = clients.begin();
    while(it!=clients.end()){
        Client * client = *it;
        it++;
        if(client->fd()!=fd)
            client->write(buffer, count);
    }
}

void sendToAll(char * buffer, int count){ //do usuniecia
    auto it = clients.begin();
    while(it!=clients.end()){
        Client * client = *it;
        it++;
        client->write(buffer, count);
    }
}

void sendToAllInGame(Message* message){ //nw
    auto it = clients.begin();
    while(it!=clients.end()){
        Client * client = *it;
        it++;
        client->writem(message);
    }
}

void sendToAllButInGame(int fd, Message* message){ //naprawic i zrobic in game serio
    auto it = clients.begin();
    while(it!=clients.end()){
        Client * client = *it;
        it++;
        if(client->fd()!=fd)
            client->writem(message);
    }
}