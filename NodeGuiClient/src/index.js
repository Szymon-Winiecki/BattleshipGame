const Gui = require("./gui");
const RoundTimerWidget = require("./GuiWidgets/roundTimerWidget");
const Board = require("./board");

const gui = new Gui();

showConnectScreen();

function showConnectScreen(){
  gui.showConnectScreen((addr, port) => {
    console.log(`łączenie z ${addr}:${port}`);
    showMenuScreen(addr, port);
  });
}

function showMenuScreen(addr, port){
  const menuScreen = gui.showMenuScreen(
    () => { console.log(`tworzenie nowej gry`); showGameScreen('game1', addr, port); },
    (gameId) => { console.log(`dołączanie do gry ${gameId}`); showGameScreen(gameId, addr, port); },
    () => { console.log(`zmiana serwera`); showConnectScreen(); },
    () => { console.log(`wyjście`); }
  );

  menuScreen.serverStatusWidget.setStatus(true);
  menuScreen.serverStatusWidget.setAddress(addr, port);
}

function showGameScreen(gameId, addr, port){
  const board1 = Board.decode("6|001000001010203010020000000440000020");
  const board2 = Board.decode("6|002000000000203000020003000440000020");

  const gameScreen = gui.showGameScreen(
    gameId,
    (x, y) => {console.log(`głos na: [${x},  ${y}]`);},
    () => {console.log('wyjście'); showMenuScreen(addr, port); }
    );

  gameScreen.playerBoardWidget.setBoard(board1);
  gameScreen.opponentBoardWidget.setBoard(board2);

  gameScreen.roundTimerWidget.setRound(RoundTimerWidget.RoundType.OWN);
  gameScreen.roundTimerWidget.setEndTime(Date.now() + 30000);

  gameScreen.serverStatusWidget.setStatus(true);
  gameScreen.serverStatusWidget.setAddress(addr, port);
}