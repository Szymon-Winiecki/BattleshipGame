const { QLabel, FlexLayout, QWidget, QMainWindow, QLineEdit, QPushButton } = require("@nodegui/nodegui");

const GuiScreen = require("./guiScreen");
const guiLayout = require("./guiLayout");
const ServerStatusWidget = require("./serverStatusWidget");
const RoundTimerWidget = require("./roundTimerWidget");
const BoardWidget = require("./boardWidget");

class GameScreen extends GuiScreen{
    #rootView;
    serverStatusWidget;
    roundTimerWidget;
    playerBoardWidget;
    opponentBoardWidget;

    #onVoteCallabck;
    #onExitCallback;

    constructor(gameId, onVoteCallabck, onExitCallback){
        super();

        this.#onVoteCallabck = onVoteCallabck;
        this.#onExitCallback = onExitCallback;

        this.#init(gameId);
    }

    #init(gameId){
        //root view
        this.#rootView = new QWidget();
        const rootViewLayout = new FlexLayout();
        this.#rootView.setLayout(rootViewLayout);
        this.#rootView.setObjectName("rootView");
    
        //layout
        const [gameView, gameViewLayout] = guiLayout.Column("game");
        const [statusRow, statusRowLayout] = guiLayout.Row("statusRow");
        const [mainRow, mainRowLayout] = guiLayout.Row("mainRow");
        const [yourBoardCol, yourBoardColLayout] = guiLayout.Column("boardRow");
        const [opponentBoardCol, opponentBoardColLayout] = guiLayout.Column("boardRow");
    
        
        //widgets

        this.serverStatusWidget = new ServerStatusWidget();

        const gameIdLabel = new QLabel();
        gameIdLabel.setText(gameId);

        this.roundTimerWidget = new RoundTimerWidget();

        //tutaj zrobić legendę 

        const yourBoardLabel = new QLabel();
        yourBoardLabel.setText('twoja plansza');

        this.playerBoardWidget = new BoardWidget(false);

        const opponentBoardLabel = new QLabel();
        opponentBoardLabel.setText('plansza przeciwnika');

        this.opponentBoardWidget = new BoardWidget(true);
        

        //tutaj zrobić listę graczy

        const exitButton = new QPushButton();
        exitButton.setText("wyjdź z gry");

    
        //add widgets to layouts
    
        rootViewLayout.addWidget(gameView);

        gameViewLayout.addWidget(statusRow);
        gameViewLayout.addWidget(this.roundTimerWidget.getWidget());
        gameViewLayout.addWidget(mainRow);
        gameViewLayout.addWidget(exitButton);

        statusRowLayout.addWidget(this.serverStatusWidget.getWidget());
        statusRowLayout.addWidget(gameIdLabel);

        mainRowLayout.addWidget(yourBoardCol);
        mainRowLayout.addWidget(opponentBoardCol);

        yourBoardColLayout.addWidget(yourBoardLabel);
        yourBoardColLayout.addWidget(this.playerBoardWidget.getWidget());

        opponentBoardColLayout.addWidget(opponentBoardLabel);
        opponentBoardColLayout.addWidget(this.opponentBoardWidget.getWidget());

        //events

        this.opponentBoardWidget.setOnClick(this.#onVoteCallabck);
        exitButton.addEventListener('clicked', this.#onExitCallback);

    
        //styling
    
        this.#rootView.setStyleSheet(`
        #rootView {
            align-items: 'center';
            justify-content: 'center';
            padding: 5px;
        }
        #game{
            height: '90%';
            width: '70%';
            align-items: 'center';
            justify-content: 'space-around';
        }
        #statusRow,#mainRow{
            width: '100%';
            justify-content: 'space-between';
        }
        #boardRow{
            align-items: 'center';
        }
        `);
    }

    getWidget(){
        return this.#rootView;
    }
}

module.exports = GameScreen;