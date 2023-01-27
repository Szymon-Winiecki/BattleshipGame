const Board = require("./board");

class Game{
    gameId;
    teams = [[],[]]
    boards = [new Board(), new Board()];
    currentVotingId = 'testVoting';
}

module.exports = Game;