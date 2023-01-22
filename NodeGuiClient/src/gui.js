const { QLabel, FlexLayout, QWidget, QMainWindow, QLineEdit, QPushButton } = require("@nodegui/nodegui");
const GuiBoard = require("./GuiWidgets/guiBoard");
const Board = require("./board");
const connection = require("./connection");

const Message = require("./message").Message;
const MessageType = require("./message").MessageType;

function initWindow(){
  const win = new QMainWindow();
  win.setWindowTitle('Battleship');
  win.resize(800, 600);

  win.show();
  global.win = win;

  showConnectionConfiguration();
}

function showConnectionConfiguration(){

  //root view
  const rootView = new QWidget();
  const rootViewLayout = new FlexLayout();
  rootView.setLayout(rootViewLayout);
  rootView.setObjectName("rootView");

  //connection configuration layout

  const connConfWidget = new QWidget();
  const connConfLayout = new FlexLayout();
  connConfWidget.setLayout(connConfLayout);
  connConfWidget.setObjectName("connConf");

  const addrInputRow = new QWidget();
  const addrInputRowLayout = new FlexLayout();
  addrInputRow.setLayout(addrInputRowLayout);
  addrInputRow.setObjectName("addrInputRow");

  const portInputRow = new QWidget();
  const portInputRowLayout = new FlexLayout();
  portInputRow.setLayout(portInputRowLayout);
  portInputRow.setObjectName("portInputRow");


  //connection configurtation widgtes

  const connConfTitleLabel = new QLabel();
  connConfTitleLabel.setText("Połącz z serwerem")

  const addrInputLabel = new QLabel();
  addrInputLabel.setText("adres: ");
  addrInputLabel.setObjectName("addrInputLabel");

  const addrInput = new QLineEdit();
  addrInput.setObjectName("addrInput");
  addrInput.setText('127.0.0.1');

  const portInputLabel = new QLabel();
  portInputLabel.setText("port:  ");
  portInputLabel.setObjectName("portInputLabel");

  const portInput = new QLineEdit();
  portInput.setObjectName("portInput");
  portInput.setText("1234");

  const connectButton = new QPushButton();
  connectButton.setText("Połącz");
  connectButton.setObjectName("connectButton");

  const loadingLabel = new QLabel();
  loadingLabel.setText("");
  loadingLabel.setObjectName("loadingLabel");

  //add widgets to layouts

  rootViewLayout.addWidget(connConfWidget);

  connConfLayout.addWidget(connConfTitleLabel);
  connConfLayout.addWidget(addrInputRow);
  connConfLayout.addWidget(portInputRow);

  addrInputRowLayout.addWidget(addrInputLabel);
  addrInputRowLayout.addWidget(addrInput);

  portInputRowLayout.addWidget(portInputLabel);
  portInputRowLayout.addWidget(portInput);

  connConfLayout.addWidget(connectButton);
  connConfLayout.addWidget(loadingLabel);

  //events

  connectButton.addEventListener('clicked', () => {
    const addr = addrInput.text();
    const port = parseInt(portInput.text());
    connection.connect(addr, port, () => {
        showBoard();
    });
    loadingLabel.setText("Łączenie...");
  });

  //styling

  rootView.setStyleSheet(`
    #rootView {
      width: 100%;
      align-items: 'center';
      justify-content: 'center';
      padding: 5px;
    }
    #addrInputRow, #portInputRow {
      flex-direction: 'row';
    }
    #connectButton {
      width: 120px;
    }
  `);

  win.setCentralWidget(rootView);
}

function showBoard(){
  const rootView = new QWidget();
  const rootViewLayout = new FlexLayout();
  rootView.setLayout(rootViewLayout);
  rootView.setObjectName("rootView");

  const gameLabel = new QLabel();
  gameLabel.setObjectName("gameLabel");
  gameLabel.setText("Gra w statki");

  function onClick(x, y){
    console.log("[" + x + ",  " + y + "]");
  }

  const board = Board.decode("6|001000001010203010020000000440000020");
  const guiBoard = new GuiBoard(board);
  guiBoard.setFieldSize(40);
  guiBoard.setOnClick(onClick);
  const boardView = guiBoard.getWidget();
  
  rootViewLayout.addWidget(gameLabel);
  rootViewLayout.addWidget(boardView);

  rootView.setStyleSheet(`
    #rootView {
      width: 100%;
      align-items: 'center';
      justify-content: 'space-around';
      padding: 5px;
    }
    #gameLabel{
      font-size: 20px;
    }
  `);

  win.setCentralWidget(rootView);
}

module.exports = {
    initWindow
}