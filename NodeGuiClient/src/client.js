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
    #gameScreen;

    constructor(){
        this.#gui = new Gui();
        this.#connection = new Connection((addr, port) => { this.#onConnected(addr, port); }, (message) => { this.#onMessage(message); }, (error) => { this.#onConnectionError(error) }, () => { this.#onConnectionClosed(); });

        this.#game = new Game();
        this.#player = new Player();

        this.#gui.showConnectScreen((addr, port) => { this.#connectToServer(addr, port); });
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
        this.#connectionScreen = this.#gui.showConnectScreen((addr, port) => { this.#connectToServer(addr, port); });
    }

    #closeApp(){
        console.log('wychodzenie z aplikacji');
    }

    #onVote(x, y){
        this.#connection.send(new Message(MessageType.VOTE, this.#game.currentVotingId, `${x}&${y}`, ''));
    }

    #exitGame(){
        this.#connection.send(new Message(MessageType.LEAVE));
        this.#menuScreen = this.#gui.showMenuScreen(() => { this.#createGame(); },(gameId) => { this.#joinGame(gameId); }, () => { this.#disconnectFromServer(); }, () => { this.#closeApp(); });
    }

    /*
     * Metody wywoływane przez socket 
     */

    #onConnected(addr, port){
        this.#serverAddr = addr;
        this.#serverPort = port;
        this.#menuScreen = this.#gui.showMenuScreen(() => { this.#createGame(); },(gameId) => { this.#joinGame(gameId); }, () => { this.#disconnectFromServer(); }, () => { this.#closeApp(); });
        this.#menuScreen.serverStatusWidget.setStatus(true);
        this.#menuScreen.serverStatusWidget.setAddress(addr, port);
    }

    #onMessage(message){
        switch(message.getType()){ 
            case MessageType.INFO: 
              console.log(message.getParam1());
            break;
            case MessageType.ERROR: 
              console.log(message.getParam1());
            break;
            case MessageType.SERVERERROR:
              console.log(message.getParam1());
              return -2; //rozlacz z serwerem nw czy to tu dziala, nietestowane
            break;

             /*
            MessageType.CREATE - informuje o grze ktora stworzylismy, jest odpowiedzia na wyslana od nas do serwera wiadomosc typu CREATE
            Dostajemy informacje o:
             ID gracza               (param1) 
             ID druzyny              (param2)
             ID gry                  (objecttype)
            */
            case MessageType.CREATE: 
      
              console.log("Udalo sie stworzyc gre o id: "+message.getObjectId());
              this.#onGameJoined(message.getObjectId(), message.getParam1(), parseInt(message.getParam2()))
      
            break;

            /*
            MessageType.JOIN - informuje o grze do ktorej dolaczylismy, jest odpowiedzia na wyslana od nas do serwera wiadomosc typu JOIN
            Dostajemy informacje o:
             ID gracza               (param1) 
             ID druzyny              (param2)
             ID gry                  (objecttype)
            */
            case MessageType.JOIN:
      
              console.log("dolaczono do gry "+message.getObjectId());
              this.#onGameJoined(message.getObjectId(), message.getParam1(), parseInt(message.getParam2()))
              
            break;

             /*
            MessageType.SHOWTEAMS - informuje o graczach w grze do ktorej dolaczylismy, jest odpowiedzia na wyslana od nas do serwera wiadomosc typu JOIN, ale moze byc tez uzywana osobno
            Dostajemy informacje o:
             lista z ID graczy       (param2) 
             ID druzyny              (param1)
             ID gry                  (objecttype)
             jedna wiadomosc typu SHOWTEAMS przesyla informacje na temat JEDNEJ druzyny
            */
            case MessageType.SHOWTEAMS: //przesyla po kolei druzyne 0 i potem 1
      
                console.log(message.getParam1());
                console.log(message.getParam2());
            break;

             /*
            MessageType.LEAVE - informuje o naszym opuszczeniu gry, jest odpowiedzia na wyslana od nas do serwera wiadomosc typu LEAVE
            Dostajemy informacje o: 
            tekst o opuszczeniu gry  (param1) //do zmiany pewnie
            */
            case MessageType.LEAVE: 
              console.log(message.getParam1());
              
            break;

            /*
            MessageType.PLAYERLEFT - informuje o graczu ktory odszedl z naszej gry
            Dostajemy informacje o:
             ID gracza               (param1) 
             ID druzyny w jakiej byl (param2)
             ID gry                  (objecttype)
            */
            case MessageType.PLAYERLEFT:
              console.log("Gracz "+message.getParam1()+" opuscil gre");

            break;

            /*
            MessageType.PLAYERJOINED - informuje o graczu ktory dolaczyl do naszej gry
            Dostajemy informacje o:
             ID gracza                     (param1)
             ID druzyny do jakiej dolaczyl (param2)
             ID gry                        (objecttype)
            */
            case MessageType.PLAYERJOINED: 
              console.log("Gracz "+message.getParam1()+" dolaczyl do gry");
            break;

             /*
            MessageType.CHANGETEAM - informuje o zmianie druzyny jakiegos gracza (jeszcze nie przetestowane)
            Dostajemy informacje o:
             ID gracza                    (param1) 
             ID druzyny na jaka zmieniamy (param2)
             ID gry                       (objecttype)
            */
            case MessageType.CHANGETEAM: //nie dziala bo nie dziala removePlayerFromTeam
              
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
                console.log(message.encode());
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
                console.log(message.encode());
                this.#updateField(parseInt(message.getObjectId()), message.getParam1(), parseInt(message.getParam2()));
            break;

            default:
              console.log("incorrect message, albo jeszcze nie ustawiona\n");
            break;
        }
    }

    #onConnectionError(error){
        console.error(error());
    }

    #onConnectionClosed(){
        this.#connectionScreen = this.#gui.showConnectScreen((addr, port) => { this.#connectToServer(addr, port); });
    }
    
    /*
     * Metody wywoływane przez wiadomości
     */

    #onGameJoined(gameId, playerId, team){
        this.#game.gameId = gameId;
        this.#player.playerId = playerId;
        this.#player.team = team;

        this.#gameScreen = this.#gui.showGameScreen(gameId, (x, y) => { this.#onVote(x, y); },  () => { this.#exitGame(); });

        this.#gameScreen.serverStatusWidget.setStatus(true);
        this.#gameScreen.serverStatusWidget.setAddress(this.#serverAddr, this.#serverPort);

        this.#connection.send(new Message(MessageType.GETROUND));
        this.#connection.send(new Message(MessageType.GETMAP, '', '0', ''));
        this.#connection.send(new Message(MessageType.GETMAP, '', '1', ''));
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
        else{
            this.#gameScreen.roundTimerWidget.setRound(RoundTimerWidget.RoundType.OPPONENT);
            this.#gameScreen.opponentBoardWidget.setInteractive(false);
        }
        
        this.#gameScreen.roundTimerWidget.setEndTime(endTime);
    }

    #updatePlayersList(team, list){
        if(team == this.#player.team){
            this.#gameScreen.playerTeamList.setList(list);
        }
        else{
            this.#gameScreen.opponentTeamList.setList(list);
        }
    }

    #updateBoard(team, serializedBoard){
        const board = Board.decode(serializedBoard);
        this.#game.boards[team] = board;
        if(team == this.#player.team){
            this.#gameScreen.playerBoardWidget.setBoard(board);
        }
        else{
            this.#gameScreen.opponentBoardWidget.setBoard(board);
        }
    }

    #updateField(team, field, status){
        const separatorIndex = field.indexOf('&');
        const x = parseInt(field.substring(0, separatorIndex));
        const y = parseInt(field.substring(separatorIndex + 1));

        this.#game.boards[team].changeStatus(x, y, status);
        if(team == this.#player.team){
            this.#gameScreen.playerBoardWidget.updateFields();
        }
        else{
            this.#gameScreen.opponentBoardWidget.updateFields();
        }
    }
    
}

module.exports = Client;