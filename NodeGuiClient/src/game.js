const Board = require("./board");

class Game{
    gameId;
    teams;
    boards;
    currentVotingId;

    constructor(){
        this.clear();
    }

    clear(){
        this.gameId = '';
        this.teams = [[],[]];
        this.boards = [new Board(), new Board()];
        this.currentVotingId = '';
    }
}

module.exports = Game;