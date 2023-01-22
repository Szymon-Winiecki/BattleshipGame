


class Player {
    #fd
    #playerId;
    #team;
    #teams;
    #game;

    constructor() {
        this.#fd = null
        this.#playerId = "";
        this.#team = null;
        this.#teams = new Array(2);
        this.#teams = [[],[]];
        this.#game = "";
    }

    setFd(fd){
        this.#fd = fd
    }
    setPlayerid(id){
        this.#playerId=id;
    }
    setTeamId(id){
        this.#team=id;
    }
    addPlayerToTeam(id,playerid){
        this.#teams[id].push(playerid);
    }
    removePlayerFromTeam(id,playerid){
        let index = this.#teams[id].indexOf(playerid); 
       
        if (index !== -1) {
            this.#teams[id].splice(index,1);
        }
    }
    setGameId(){
        return this.#game;
    }
    emptyTeams() {
        this.#teams = [[],[]];
    }

    clear(){
        this.emptyTeams();
        this.#fd = null;
        this.#playerId = "";
        this.#team = null;
        this.#game = "";
    }


    //get functions
    getPlayerid(){
        return this.#playerId;
    }
    getTeamId(){
        return this.#team;
    }
    getTeam(id){
        return this.#teams[id];
    }
    getGameId(){
        return this.#game;
    }
    getFd(fd){
        return this.#fd
    }


};


let player = new Player();

module.exports = {
    player
}