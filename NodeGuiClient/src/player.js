
class Player{
    playerId;
    team;
    isCreator;

    constructor(){
        this.clear();
    }

    clear(){
        this.playerId = '';
        this.team = 0;
        this.isCreator = false;
    }
}

module.exports = Player;
