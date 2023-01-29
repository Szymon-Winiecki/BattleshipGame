const { QLabel, FlexLayout, QWidget, QPushButton } = require("@nodegui/nodegui");

const GuiScreen = require("./guiScreen");
const guiLayout = require("./guiLayout");
const ServerStatusWidget = require("./serverStatusWidget");
const RoundTimerWidget = require("./roundTimerWidget");
const BoardWidget = require("./boardWidget");
const PlayersListWidget = require("./playersListWidget");

class GameScreen extends GuiScreen{
    #rootView;
    serverStatusWidget;
    roundTimerWidget;
    playerBoardWidget;
    opponentBoardWidget;
    playerTeamList;
    opponentTeamList;

    #onVoteCallabck;
    #onExitCallback;

    constructor(gameId, playerId, onVoteCallabck, onExitCallback){
        super();

        this.#onVoteCallabck = onVoteCallabck;
        this.#onExitCallback = onExitCallback;

        this.#init(gameId, playerId);
    }

    #init(gameId, playerId){
        //root view
        this.#rootView = new QWidget();
        const rootViewLayout = new FlexLayout();
        this.#rootView.setLayout(rootViewLayout);
        this.#rootView.setObjectName("rootView");
    
        //layout
        const [gameView, gameViewLayout] = guiLayout.Column("game");
        const [statusRow, statusRowLayout] = guiLayout.Row("statusRow");
        const [mainRow, mainRowLayout] = guiLayout.Row("mainRow");
        const [legendRow, legendRowLayout] = guiLayout.Column("legendRow");
        const [yourBoardCol, yourBoardColLayout] = guiLayout.Column("boardRow");
        const [opponentBoardCol, opponentBoardColLayout] = guiLayout.Column("boardRow");
        const [teamsRow, teamsRowLayout] = guiLayout.Row("teams");
    
        
        //widgets

        this.serverStatusWidget = new ServerStatusWidget();

        const gameIdLabel = new QLabel();
        gameIdLabel.setText(gameId);

        const playerIdLabel = new QLabel();
        playerIdLabel.setText(playerId);

        this.roundTimerWidget = new RoundTimerWidget();

        //tutaj zrobić legendę 
        const legendLabel = new QLabel();
        legendLabel.setText("Legenda:");
        legendLabel.setObjectName("legendLabel");

        const legendLabel0 = new QLabel();
        legendLabel0.setText("twoj statek");
        legendLabel0.setObjectName("ship");

        const legendLabel1 = new QLabel();
        legendLabel1.setText("nieodkryty");
        legendLabel1.setObjectName("clear");

        const legendLabel2 = new QLabel();
        legendLabel2.setText("trafiony");
        legendLabel2.setObjectName("hit");

        const legendLabel3 = new QLabel();
        legendLabel3.setText("nietrafiony");
        legendLabel3.setObjectName("miss");

        const legendLabel4 = new QLabel();
        legendLabel4.setText("zatopiony");
        legendLabel4.setObjectName("sunk");

    

        const yourBoardLabel = new QLabel();
        yourBoardLabel.setText('twoja plansza');

        this.playerBoardWidget = new BoardWidget(false);

        const opponentBoardLabel = new QLabel();
        opponentBoardLabel.setText('plansza przeciwnika');

        this.opponentBoardWidget = new BoardWidget(true);
        
        this.playerTeamList = new PlayersListWidget();
        this.playerTeamList.setTitle("twoja drużyna");

        this.opponentTeamList = new PlayersListWidget();
        this.opponentTeamList.setTitle("przeciwnicy");
        

        const exitButton = new QPushButton();
        exitButton.setText("wyjdź z gry");

    
        //add widgets to layouts
    
        rootViewLayout.addWidget(gameView);

        gameViewLayout.addWidget(statusRow);
        gameViewLayout.addWidget(this.roundTimerWidget.getWidget());
        gameViewLayout.addWidget(mainRow);
        gameViewLayout.addWidget(exitButton);

        statusRowLayout.addWidget(playerIdLabel);
        statusRowLayout.addWidget(legendRow);
        statusRowLayout.addWidget(this.serverStatusWidget.getWidget());
        statusRowLayout.addWidget(gameIdLabel);

        legendRowLayout.addWidget(legendLabel);
        legendRowLayout.addWidget(legendLabel0);
        legendRowLayout.addWidget(legendLabel1);
        legendRowLayout.addWidget(legendLabel2);
        legendRowLayout.addWidget(legendLabel3);
        legendRowLayout.addWidget(legendLabel4);

        mainRowLayout.addWidget(yourBoardCol);
        mainRowLayout.addWidget(opponentBoardCol);
        mainRowLayout.addWidget(teamsRow);

        yourBoardColLayout.addWidget(yourBoardLabel);
        yourBoardColLayout.addWidget(this.playerBoardWidget.getWidget());

        opponentBoardColLayout.addWidget(opponentBoardLabel);
        opponentBoardColLayout.addWidget(this.opponentBoardWidget.getWidget());

        teamsRowLayout.addWidget(this.playerTeamList.getWidget());
        teamsRowLayout.addWidget(this.opponentTeamList.getWidget());

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
            width: '90%';
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
        #clear{
            color: 'blue';
        }
        #hit{
            color: 'red';
        }
        #miss{
            color: 'grey';
        }
        #sunk{
            color: 'black';
        }
        #ship{
            color: green;
        }
        `);
    }

    getWidget(){
        return this.#rootView;
    }
}

module.exports = GameScreen;