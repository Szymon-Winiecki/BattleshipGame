const Connection = require('./connection');
const Gui = require('./gui');
const Player = require('./player');
const Game = require('./game');
const { Message, MessageType } = require('./message');
const RoundTimerWidget = require('./GuiWidgets/roundTimerWidget');
const Board = require('./board');


class Client{
    #gui;
    #connection;
    #player;
    #game;

    #serverAddr = 'not connected';
    #serverPort = 'not connected';

    #connectionScreen;
    #menuScreen;
    #lobbyScreen;
    #gameScreen;

    constructor(){
        this.#gui = new Gui();
        this.#connection = new Connection((addr, port) => { this.#onConnected(addr, port); }, (message) => { this.#onMessage(message); }, (error) => { this.#onConnectionError(error) }, () => { this.#onConnectionClosed(); });

        this.#game = new Game();
        this.#player = new Player();
   
        this.#showConnectScreen();
    }

    /*
     *  Metody wyświetlajace ekrany
     */

    #showConnectScreen(){
        this.#connectionScreen = this.#gui.showConnectScreen((addr, port) => { this.#connectToServer(addr, port); }, () => { this.#closeApp(); });
    }

    #showMenuScreen(){
        this.#menuScreen = this.#gui.showMenuScreen(() => { this.#createGame(); },(gameId) => { this.#joinGame(gameId); }, () => { this.#disconnectFromServer(); }, () => { this.#closeApp(); });
        this.#menuScreen.serverStatusWidget.setStatus(true);
        this.#menuScreen.serverStatusWidget.setAddress(this.#serverAddr, this.#serverPort);
        this.#gameScreen = undefined;
    }

    #showLobbyScreen(){
        this.#lobbyScreen = this.#gui.showLobbyScreen(this.#game.gameId, this.#player.playerId, this.#player.isCreator,  () => { this.#exitGame(); }, () => { this.#changeTeam(); }, () => { if(this.#player.isCreator) {this.#startGame();} {} })
        this.#gameScreen = undefined;

        this.#lobbyScreen.serverStatusWidget.setStatus(true);
        this.#lobbyScreen.serverStatusWidget.setAddress(this.#serverAddr, this.#serverPort);

        this.#updatePlayersList(0, this.#game.teams[0]);
        this.#updatePlayersList(1, this.#game.teams[1]);
    }

    showGameScreen(){
        this.#gameScreen = this.#gui.showGameScreen(this.#game.gameId, this.#player.playerId, (x, y) => { this.#onVote(x, y); },  () => { this.#exitGame(); });

        this.#gameScreen.serverStatusWidget.setStatus(true);
        this.#gameScreen.serverStatusWidget.setAddress(this.#serverAddr, this.#serverPort);

        this.#updatePlayersList(0, this.#game.teams[0]);
        this.#updatePlayersList(1, this.#game.teams[1]);
    }

    /*
     * Metody wywoływane przez GUI
     */

    #connectToServer(addr, port){
        this.#connection.disconnect(); //sprawdzić co sie stanie gdy nie był połączony
        this.#connection.connect(addr, port);
    }

    #createGame(){
        this.#connection.send(new Message(MessageType.CREATE));
    }

    #joinGame(gameId){
        this.#connection.send(new Message(MessageType.JOIN, gameId));
    }

    #disconnectFromServer(){
        this.#connection.send(new Message(MessageType.DISCONNECT));
        this.#showConnectScreen();
    }

    #closeApp(){
        console.log('wychodzenie z aplikacji');
        process.exit(0);
    }

    #startGame(){
        this.#connection.send(new Message(MessageType.STARTGAME));
    }

    #enterGame(){
        this.showGameScreen();

        this.#updatePlayersList(0, this.#game.teams[0]);
        this.#updatePlayersList(1, this.#game.teams[1]);

        this.#connection.send(new Message(MessageType.GETROUND));
        this.#connection.send(new Message(MessageType.GETMAP, '', '0', ''));
        this.#connection.send(new Message(MessageType.GETMAP, '', '1', ''));
    }

    #changeTeam(){
        this.#connection.send(new Message(MessageType.CHANGETEAM));
    }

    #onVote(x, y){
        this.#connection.send(new Message(MessageType.VOTE, this.#game.currentVotingId, `${x}&${y}`, ''));
        this.#gameScreen.opponentBoardWidget.setInteractive(false);
    }

    #exitGame(){
        this.#connection.send(new Message(MessageType.LEAVE));
        this.#showMenuScreen();
    }

    /*
     * Metody wywoływane przez socket 
     */

    #onConnected(addr, port){
        this.#serverAddr = addr;
        this.#serverPort = port;
        this.#showMenuScreen();
    }

    #onMessage(message){
        switch(message.getType()){ 
            case MessageType.INFO: 
              console.log(message.getParam1());
            break;
            case MessageType.ERROR: 
              console.log(message.getParam1());
            break;

             /*
            MessageType.CREATE - informuje o grze ktora stworzylismy, jest odpowiedzia na wyslana od nas do serwera wiadomosc typu CREATE
            Dostajemy informacje o:
             ID gracza               (param1) 
             ID druzyny              (param2)
             ID gry                  (objecttype)
            */
            case MessageType.CREATE:

              this.#player.isCreator = true;
              this.#onGameJoined(message.getObjectId(), message.getParam1(), parseInt(message.getParam2()));
            break;

            /*
            MessageType.JOIN - informuje o grze do ktorej dolaczylismy, jest odpowiedzia na wyslana od nas do serwera wiadomosc typu JOIN
            Dostajemy informacje o:
             ID gracza               (param1) 
             ID druzyny              (param2)
             ID gry                  (objecttype)
            */
            case MessageType.JOIN:

              this.#player.isCreator = false;
              this.#onGameJoined(message.getObjectId(), message.getParam1(), parseInt(message.getParam2()));
            break;

             /*
            MessageType.SHOWTEAMS - informuje o graczach w grze do ktorej dolaczylismy, jest odpowiedzia na wyslana od nas do serwera wiadomosc typu JOIN, ale moze byc tez uzywana osobno
            Dostajemy informacje o:
             lista z ID graczy       (param2) 
             ID druzyny              (param1)
             ID gry                  (objecttype)
             jedna wiadomosc typu SHOWTEAMS przesyla informacje na temat JEDNEJ druzyny
            */
            case MessageType.SHOWTEAMS:
      
             //umieszczamy id graczy w liscie
             var players = message.getParam2().split('&'); 
             players.pop(); //usuniecie ostatniego bo pusty przez split
            
             const team = parseInt(message.getParam1());
             this.#updatePlayersList(team, players);
            break;

             /*
            MessageType.LEAVE - informuje o naszym opuszczeniu gry, jest odpowiedzia na wyslana od nas do serwera wiadomosc typu LEAVE
            Dostajemy informacje o: 
            tekst o opuszczeniu gry  (param1) //do zmiany pewnie
            */
            case MessageType.LEAVE: 
              console.log(message.getParam1());
              this.#player.clear();
              this.#game.clear();
              
            break;

            /*
            MessageType.CHANGETEAM - informuje o pmyślnej zmianie druzyny gracza (odpowiedź na CHANGETEAM klienta)
            Dostajemy informacje o:
             id druzyny                    (param1) 
            */
            case MessageType.CHANGETEAM: 
                this.#onTeamChanged(parseInt(message.getParam1()));
            break;

            /*
            MessageType.VOTERESULT - informuje o zakończeniu głosowania i przekazuje jego wynik (tylko do celów testowych)
            Dostajemy informacje o:
             ID głosowania                (objectId) 
             ID drużyny która głosowała   (param1)
             wynik głosowania             (param2)
            */
            case MessageType.VOTERESULT:
              this.#onVotingResult(message.getObjectId(), message.getParam2());
            break;
            
            /*
            MessageType.NEXTROUND - informuje o rozpoczęciu nowej rundy
            Dostajemy informacje o:
             ID głosowania                       (objectId) 
             ID drużyny głosującej               (param1)
             czas do końca głosowania głosowania (param2)
            */
            case MessageType.NEXTROUND:
              this.#onNextRound(message.getObjectId(), parseInt(message.getParam1()), parseInt(message.getParam2()));
            break;
            
            /*
            MessageType.GETMAP - przesyła aktualny stan mapy
            Dostajemy informacje o:
             drużyna, której to jest mapa        (objectId) 
             mapa                                (param1)
            */
            case MessageType.GETMAP:
                this.#updateBoard(parseInt(message.getObjectId()), message.getParam1());
            break;

            /*
            MessageType.UPDATEMAP - informuje o zmianie statusu pola na mapie
            Dostajemy informacje o:
             drużyna, której to jest mapa        (objectId) 
             współrzędne pola                    (param1)
             nowy status                         (param2)
            */
            case MessageType.UPDATEMAP:
                this.#updateField(parseInt(message.getObjectId()), message.getParam1(), parseInt(message.getParam2()));
            break;

            /*wiadomosc z serwera ze zostal zamkniety */
            case MessageType.SERVERERROR:
                this.#player.clear();
                this.#game.clear();
                this.#showConnectScreen();

            break;

            /*zostajesz wlascicielem gry */
            case MessageType.BEOWNER:
                this.#player.isCreator = true;
                this.#showLobbyScreen();
      
            break;

            /*wiadomos z serwera ze gra sie rozpoczyna */
            case MessageType.STARTGAME:
                this.#enterGame();
            break;
            
            /*
            MessageType.GAMEOVER - informuje o wygranej jedej z drużyn
            Dostajemy informacje o:
             drużyna, która wygrała              (objectId) 
            */
            case MessageType.GAMEOVER:
                this.#onGameOver(parseInt(message.getObjectId()));
            break;

            default:
              console.log("incorrect message, albo jeszcze nie ustawiona\n");
            break;
        }
    }

    #onConnectionError(error){
        console.error(error);
        if(error.code === 'ECONNREFUSED'){ //error ktory wystepuje gdy nie mozna sie polaczyc z serwerem(bo jest np wylaczony)
            return;
        }
        //inne bledy zwiazane z polaczeniem, mozna zrobic jak wyzej tylko dla sytuacji gdy 
        this.#disconnectFromServer();
        this.#showConnectScreen();
   
    }

    #onConnectionClosed(){
        this.#showConnectScreen();
    }
    
    /*
     * Metody wywoływane przez wiadomości
     */


    #onGameJoined(gameId, playerId, team){
        this.#game.gameId = gameId;
        this.#player.playerId = playerId;
        this.#player.team = team;

        this.#showLobbyScreen();
    }

    #onVotingResult(votingId, result){
        console.log("voting results: " + result);

        if(votingId != this.#game.currentVotingId){ //klient 'przegapił' jakąś rundę (nie otrzymał informacji o zmianie mapy)
            this.#connection.send(new Message(MessageType.GETMAP, '', '0', ''));
            this.#connection.send(new Message(MessageType.GETMAP, '', '1', ''));
        }
    }

    #onNextRound(newVotingId, team, endTime){
        this.#game.currentVotingId = newVotingId;
        if(this.#gameScreen === undefined) return;
        if(team == this.#player.team){
            this.#gameScreen.roundTimerWidget.setRound(RoundTimerWidget.RoundType.OWN);
            this.#gameScreen.opponentBoardWidget.setInteractive(true);
        }
        else if(team == (1 - this.#player.team)){
            this.#gameScreen.roundTimerWidget.setRound(RoundTimerWidget.RoundType.OPPONENT);
            this.#gameScreen.opponentBoardWidget.setInteractive(false);
        }
        else{
            this.#gameScreen.roundTimerWidget.setRound(RoundTimerWidget.RoundType.BREAK);
            this.#gameScreen.opponentBoardWidget.setInteractive(false);
        }
        
        this.#gameScreen.roundTimerWidget.setEndTime(endTime);
    }

    #onTeamChanged(newTeam){
        this.#player.team = newTeam;
    }

    #onGameOver(winner){
        this.#gameScreen.opponentBoardWidget.setInteractive(false);
        if(winner == this.#player.team){
            this.#gameScreen.roundTimerWidget.setRound(RoundTimerWidget.RoundType.WIN);
        }
        else{
            this.#gameScreen.roundTimerWidget.setRound(RoundTimerWidget.RoundType.DEFEAT);
        }  
    }

    #updatePlayersList(team, list){
        this.#game.teams[team] = list;

        if(this.#gameScreen != undefined){
            if(team == this.#player.team){
                this.#gameScreen.playerTeamList.setList(list);
            }
            else{
                this.#gameScreen.opponentTeamList.setList(list);
            }
        }
        else{
            if(team == 0){
                this.#lobbyScreen.playerTeamList.setList(list);
            }
            else{
                this.#lobbyScreen.opponentTeamList.setList(list);
            }
        }
        
    }

    #updateBoard(team, serializedBoard){
        this.#game.boards[team] = Board.decode(serializedBoard);

        if(this.#gameScreen == undefined) return;
        if(team == this.#player.team){
            this.#gameScreen.playerBoardWidget.setBoard(this.#game.boards[team]);
        }
        else{
            this.#gameScreen.opponentBoardWidget.setBoard(this.#game.boards[team]);
        }
    }

    #updateField(team, field, status){
        const separatorIndex = field.indexOf('&');
        const x = parseInt(field.substring(0, separatorIndex));
        const y = parseInt(field.substring(separatorIndex + 1));

        this.#game.boards[team].changeStatus(x, y, status);

        if(this.#gameScreen == undefined) return;
        if(team == this.#player.team){
            this.#gameScreen.playerBoardWidget.setBoard(this.#game.boards[team]);
        }
        else{
            this.#gameScreen.opponentBoardWidget.setBoard(this.#game.boards[team]);
        }
    }
    
}

module.exports = Client;
