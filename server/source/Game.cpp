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

void Game::sendToAllPlayers(Message &message){
    for(auto team : teams){
        for(auto player : team){
            player.sendMessage(message);
        }
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
}

void Game::changeTeam(int team, Player* player){
    this->leave(1-team, player);
    player->setTeamId(team);
    teams[team].push_front(*player);
}

std::string Game::getSerializedMap(int team, bool showShips){
    assertTeam(team);
    return maps[team].print(!showShips, ' ');
}