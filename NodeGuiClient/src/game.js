const Board = require("./board");

class Game{
    gameId;
    teams = new Array(2);
    boards = [new Board(), new Board()];
    currentVotingId = 'testVoting';
}

module.exports = Game;