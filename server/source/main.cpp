#include <iostream>
#include <list>

#include "../include/Message.h"
#include "../include/Voting.h"
#include "../include/Vote.h"
#include "../include/Game.h"
#include "../include/Player.h"
#include "../include/Client.h"

void printPlayersList(std::list<Player>* players){
    for(Player player : *players){
        std::cout << player.getId() << ", ";
    }
    std::cout << std::endl;
}

int main(){
    /*Message m1 = Message(MessageType::INFO, "game1", "player1", "Hello world");

    Message m2 = Message::decode("1|game2|player2|Hej");

    std::vector<std::string> vec = {"player1"};
    Voting vg1 = Voting("game1", &vec, 1000);
    std::string vid = vg1.getVotingId();

    Vote v1 = Vote("player1", "game1", vid, "c1r1");

    std::cout << m1.encode() << std::endl;
    std::cout << m2.encode() << std::endl;
    std::cout << v1.getVotingId() << std::endl;*/

    Client client = Client();

    Game game = Game();

    game.join(client, 0);
    game.join(client, 0);
    game.join(client, 1);
    game.join(client, 1);

    printPlayersList(game.getTeam(0));
    printPlayersList(game.getTeam(1));

}