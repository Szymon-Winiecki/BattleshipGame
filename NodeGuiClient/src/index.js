const Gui = require("./gui");
const RoundTimerWidget = require("./GuiWidgets/roundTimerWidget");
const Board = require("./board");
const connection = require("./connection");
const Message = require("./message").Message;
const MessageType = require("./message").MessageType;

const gui = new Gui();

showConnectScreen();

function showConnectScreen(){
  gui.showConnectScreen((addr, port) => {
    connection.connect(addr, port, () => {
    console.log(`łączenie z ${addr}:${port}`);
    showMenuScreen(addr, port);
  })});
}

function showMenuScreen(addr, port){
  const menuScreen = gui.showMenuScreen(

    () => { console.log(`tworzenie nowej gry`); 
    let message = new Message(MessageType.CREATE);
    connection.send(message);
    showGameScreen('game1', addr, port); }, 

    (gameId) => { console.log(`dołączanie do gry ${gameId}`); 
    let message = new Message(MessageType.JOIN,gameId);
    connection.send(message);
    showGameScreen(gameId, addr, port); },
    
    () => { console.log(`zmiana serwera`); 
    let message = new Message(MessageType.DISCONNECT);
    connection.send(message);
    showConnectScreen(); },
    
    () => { console.log(`wyjście`); 
    let message = new Message(MessageType.DISCONNECT);
    connection.send(message); 
    //jakis exit cos ?
    }
  );

  menuScreen.serverStatusWidget.setStatus(true);
  menuScreen.serverStatusWidget.setAddress(addr, port);
}

function showGameScreen(gameId, addr, port){
  const board1 = Board.decode("6|001000001010203010020000000440000020");
  const board2 = Board.decode("6|002000000000203000020003000440000020");

  const gameScreen = gui.showGameScreen(
    gameId,

    (x, y) => {console.log(`głos na: [${x},  ${y}]`);
    //let message = new Message(MessageType.VOTE);//przemyslec
  
    },

    () => {console.log('wyjście'); 
    let message = new Message(MessageType.LEAVE);
    connection.send(message);
    showMenuScreen(addr, port); }
    );

  gameScreen.playerBoardWidget.setBoard(board1);
  gameScreen.opponentBoardWidget.setBoard(board2);

  gameScreen.roundTimerWidget.setRound(RoundTimerWidget.RoundType.OWN);
  gameScreen.roundTimerWidget.setEndTime(Date.now() + 30000);

  gameScreen.serverStatusWidget.setStatus(true);
  gameScreen.serverStatusWidget.setAddress(addr, port);
}
