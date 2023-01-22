#include "../include/Game.h"

int Game::nextId = 1;
std::string Game::generateId(){
    std::ostringstream id;
    id << "game" << nextId++;
    return id.str();
}

Game::Game() :
    gameId { generateId() },
    maxPlayers { 2 },
    roundDuration {5 * 1000}, // 5s
    maps { Map(6), Map(6)},
    isOpen { false },
    started { false },
    currentTeam { 0 } {

        //ustawienie kilku przykladowych stakow na mapie
        maps[0].placeShip(1, 1, 2, false);
        maps[0].placeShip(3, 2, 3, true);
        maps[1].placeShip(1, 4, 2, true);
        maps[1].placeShip(4, 1, 3, false);

        open();
        start();
    }

void Game::open(){
    isOpen = true;
}

void Game::start(){
    started = true;
    startTime = std::chrono::duration_cast< std::chrono::milliseconds >(std::chrono::system_clock::now().time_since_epoch()).count();

    Message team0map0 = Message(MessageType::GETMAP, "", "0", maps[0].serialize(false, '|'));
    Message team0map1 = Message(MessageType::GETMAP, "", "1", maps[1].serialize(true, '|'));

    sendToTeam(team0map0, 0);
    sendToTeam(team0map1, 0);

    Message team1map0 = Message(MessageType::GETMAP, "", "0", maps[0].serialize(true, '|'));
    Message team1map1 = Message(MessageType::GETMAP, "", "1", maps[1].serialize(false, '|'));

    sendToTeam(team1map0, 1);
    sendToTeam(team1map1, 1);

    nextRound();
}

void Game::nextRound(){
    if(activeVoting != NULL){
        std::string result = activeVoting->getResult();
        sendResult(result);
    }
    delete activeVoting;
    currentTeam = 1 - currentTeam;
    activeVoting = new Voting(getId(), getTeam(currentTeam), roundDuration);
    sendNextRoundInfo();

    runRoundController();
}

void Game::runRoundController(){
    std::thread* vct = new std::thread([this] {
			std::this_thread::sleep_for(std::chrono::milliseconds(this->roundDuration));
            this->nextRound();
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

void Game::sendToTeam(Message &message, int team){
    assertTeam(team);
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
    if(status == FieldStatus::SUNK){
        //wysłać całą mapę, bo zmienia się nie tylko ostrzeliwywane pole
    }
    else{
        //wysłać tylko status ostrzelanego pola
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
    return &(*teams[team].begin());
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

void Game::leave(int team, Player* player){
    teams[team].remove(*player);
    Message message1 = Message(PLAYERLEFT,player->getGame()->getId(),player->getId(),std::to_string(player->getTeamId()));
    sendToAllPlayers(message1); 
}

void Game::changeTeam(int team, Player* player){
    this->leave(1-team, player);
    player->setTeamId(team);
    teams[team].push_front(*player);
    Message message1 = Message(CHANGETEAM,player->getGame()->getId(),player->getId(),std::to_string(player->getTeamId()));
    sendToAllPlayers(message1);                

}

std::string Game::getSerializedMap(int team, bool showShips){
    assertTeam(team);
    return maps[team].print(!showShips, ' ');
}

int Game::getNumberOfPlayers(){
    return getTeam(0)->size() + getTeam(1)->size();
}