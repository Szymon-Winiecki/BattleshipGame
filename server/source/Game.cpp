#include "../include/Game.h"

int Game::nextId = 1;
std::string Game::generateId(){
    std::ostringstream id;
    id << "game" << nextId++;
    return id.str();
}

Game::Game() :
    gameId { generateId() },
    maxPlayers { 8 },
    roundDuration {10 * 1000}, // 10s
    maps { Map(6), Map(6)},
    isOpen { false },
    started { false },
    owner { nullptr },
    currentTeam { 0 },
    toDelete (false) {

        //ustawienie kilku przykladowych stakow na mapie
        maps[0].placeShip(1, 1, 2, false);
        maps[0].placeShip(3, 2, 3, true);
        maps[1].placeShip(1, 4, 2, true);
        maps[1].placeShip(4, 1, 3, false);

        open();
    }

void Game::open(){
    isOpen = true;
}

void Game::start(){
    started = true;
    startTime = std::chrono::duration_cast< std::chrono::milliseconds >(std::chrono::system_clock::now().time_since_epoch()).count();

    Message start = Message(STARTGAME); //wiadomosc do wszystkich graczy zeby zaczela im sie gra
    sendToAllPlayers(start);

    Message team0map0 = Message(MessageType::GETMAP, "0", maps[0].serialize(false, '&'), "");
    Message team0map1 = Message(MessageType::GETMAP, "1", maps[1].serialize(true, '&'), "");

    sendToTeam(team0map0, 0);
    sendToTeam(team0map1, 0);

    Message team1map0 = Message(MessageType::GETMAP, "0", maps[0].serialize(true, '&'), "");
    Message team1map1 = Message(MessageType::GETMAP, "1", maps[1].serialize(false, '&'), "");

    sendToTeam(team1map0, 1);
    sendToTeam(team1map1, 1);

    nextRound();
}

void Game::close(){
    isOpen = false;
}

void Game::deleteNextRound(){
    toDelete = true;
}

void Game::nextRound(){
    if(activeVoting != NULL){
        std::string result = activeVoting->getResult();
        sendResult(result);
        std::vector<int> fieldToShot = activeVoting->getDecodedResult();
        shoot(1 - currentTeam, fieldToShot[0], fieldToShot[1]);
    }
    delete activeVoting;

    if(toDelete) return;
    
    currentTeam = 1 - currentTeam;
    activeVoting = new ShotVoting(getId(), getTeam(currentTeam), roundDuration, &maps[1 - currentTeam]);
    sendNextRoundInfo();

    runRoundController();
}

void Game::runRoundController(){
    std::thread* vct = new std::thread([this] {
			std::this_thread::sleep_for(std::chrono::milliseconds(this->roundDuration));
            this->nextRound();
            if(this->toDelete){
                delete this;
            }
	});
}

void Game::sendResult(std::string &result){
    Message m = Message(VOTERESULT, activeVoting->getVotingId(), std::to_string(currentTeam), result);
    sendToAllPlayers(m);
}

void Game::sendNextRoundInfo(){
    Message m = Message(NEXTROUND, activeVoting->getVotingId(), std::to_string(currentTeam), std::to_string(activeVoting->getEndTime()));
    sendToAllPlayers(m);
}

void Game::sendCurrentTeams(){
    Message m1 = currentTeamInfo(0);
    Message m2 = currentTeamInfo(1);
    sendToAllPlayers(m1);
    sendToAllPlayers(m2);
}

void Game::sendToTeam(Message &message, int team){
    assertTeam(team);
    if(teams[team].empty()){
        return;
    }
    for(auto player : teams[team]){
        player.sendMessage(message);
    }
}

void Game::sendToAllPlayers(Message &message){
    for(int i = 0; i < 2; ++i){
        sendToTeam(message, i);
    }
}

void Game::shoot(int map, int x, int y){
    assertTeam(map);
    FieldStatus status = maps[map].shoot(x, y);
    if(status == FieldStatus::SUNK){ //zatopiony - mogło zmienić się więcej niż jedno pole - wysyłamy całą mapę
        Message m1 = Message(GETMAP, std::to_string(map), getSerializedMap(map, true), ""); //mapa z pokazanymi statkami
        sendToTeam(m1, map);
        Message m2 = Message(GETMAP, std::to_string(map), getSerializedMap(map, false), ""); //mapa bez statków
        sendToTeam(m2, 1 - map);
    }
    else{ //zmieniło się tylko jedno pole, więc tylko je wysyłamy
        Message m = Message(UPDATEMAP, std::to_string(map), (std::to_string(x) + "&" + std::to_string(y)), std::to_string(static_cast<int>(status)));
        sendToAllPlayers(m);
    }
}

Player* Game::join(int team){
    if(!isOpen){
        return NULL;
    }
    if(teams[0].size() + teams[1].size() >= maxPlayers){
        return NULL;
    }
    assertTeam(team);
    Player newPlayer = Player();
    newPlayer.setTeamId(team);
    teams[team].push_front(newPlayer);

    sendCurrentTeams();

    return &(*teams[team].begin());
}

void Game::leave(int team, Player* player){
    teams[team].remove(*player);

    sendCurrentTeams();
    /*Message message1 = Message(PLAYERLEFT,player->getGame()->getId(),player->getId(),std::to_string(player->getTeamId()));
    sendToAllPlayers(message1); */
}

void Game::changeTeam(int team, Player* player){
    this->leave(1-team, player);
    player->setTeamId(team);
    teams[team].push_front(*player);

    sendCurrentTeams();
    /*Message message1 = Message(CHANGETEAM,player->getGame()->getId(),player->getId(),std::to_string(player->getTeamId()));
    sendToAllPlayers(message1);      */          

}

std::string Game::getId(){
    return gameId;
}

long Game::getStartTime(){
    return startTime;
}

std::list<Player>* Game::getTeam(int team){
    assertTeam(team);
    return &teams[team];
}

void Game::assertTeam(int team){
    if(team < 0 || team > 1){
        throw new std::out_of_range("the \'team\' argument can only take the value of 0 or 1");
    }
}

bool Game::vote(Vote &vote){
    if(activeVoting == NULL) return false;
    return activeVoting->vote(vote);
}

std::string Game::serializeTeam(int team, char separator){
    assertTeam(team);

    if(teams[team].empty()){
        return "";
    }

    std::stringstream serialized {""};
    for(Player player : teams[team]){
        serialized << player.getId() << separator;
    }

    return serialized.str();
}

void Game::setOwner(Player* owner){
    this->owner = owner;
}

Player* Game::getOwner(){
    return owner;
}

void Game::removeOwner(){
    this->owner = nullptr;
}

Player* Game::changeOwner(){
    this->owner = nullptr;
    if(this->teams[0].size()>0){
        this->owner = &this->teams[0].front();
    }
    else if(this->teams[1].size()>0){
        this->owner = &this->teams[1].front();
    }

    if(owner != nullptr){
        Message message = Message(BEOWNER,this->getId());
        this->owner->sendMessage(message);
    }
    return this->owner;
}

std::string Game::getSerializedMap(int team, bool showShips){
    assertTeam(team);
    return maps[team].serialize(!showShips, '&');
}

int Game::getNumberOfPlayers(){
    return getTeam(0)->size() + getTeam(1)->size();
}

Message Game::currentRoundInfo(){
    if(!started){
        return Message(NEXTROUND, "", "2", "0");
    }
    return Message(NEXTROUND, activeVoting->getVotingId(), std::to_string(currentTeam), std::to_string(activeVoting->getEndTime()));
}

Message Game::currentTeamInfo(int team){
    assertTeam(team);
    return Message(SHOWTEAMS, getId(), std::to_string(team), serializeTeam(team, '&'));
}

