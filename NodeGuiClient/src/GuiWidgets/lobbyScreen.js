const { QLabel, FlexLayout, QWidget, QLineEdit, QPushButton, QKeyEvent } = require("@nodegui/nodegui");


const GuiScreen = require("./guiScreen");
const guiLayout = require("./guiLayout");
const ServerStatusWidget = require("./serverStatusWidget");
const PlayersListWidget = require("./playersListWidget");

class lobbyScreen extends GuiScreen{
    #rootView;
    serverStatusWidget;
    playerTeamList;
    opponentTeamList;
    numberOfReadyPlayers;


    #onExitCallback;
    #onChangeTeamCallback;
    #onStartGameCallback

    constructor(gameId, playerId, isOwner, onExitCallback, onChangeTeamCallback, onStartGameCallback){
        super();

        this.#onExitCallback = onExitCallback;
        this.#onChangeTeamCallback = onChangeTeamCallback
        this.#onStartGameCallback = onStartGameCallback;

        this.#init(gameId, playerId, isOwner);
    }

    #init(gameId, playerId, isOwner){
        //root view
        this.#rootView = new QWidget();
        const rootViewLayout = new FlexLayout();
        this.#rootView.setLayout(rootViewLayout);
        this.#rootView.setObjectName("rootView");
    

        
        //layout
        const [lobbyView, lobbyViewLayout] = guiLayout.Column("lobby");
        const [statusRow, statusRowLayout] = guiLayout.Row("statusRow");
        const [teamsRow, teamsRowLayout] = guiLayout.Row("teams");
    
        //widgets

        this.serverStatusWidget = new ServerStatusWidget();

        const gameIdLabel = new QLabel();
        gameIdLabel.setText(gameId);

        const playerIdLabel = new QLabel();
        playerIdLabel.setText(playerId);


        const changeTeamButton = new QPushButton();
        changeTeamButton.setText("zmień druzyne");
        

        const exitButton = new QPushButton();
        exitButton.setText("wyjdz do menu");

        this.playerTeamList = new PlayersListWidget();
        this.playerTeamList.setTitle("Druzyna 1");

        this.opponentTeamList = new PlayersListWidget();
        this.opponentTeamList.setTitle("Druzyna 2");

        this.numberOfReadyPlayersc = new QLabel();

    
        //add widgets to layouts
    


        rootViewLayout.addWidget(lobbyView);

        lobbyViewLayout.addWidget(statusRow);
        lobbyViewLayout.addWidget(teamsRow);
        lobbyViewLayout.addWidget(changeTeamButton);
        if(isOwner){

            const [roundTimeRow, roundTimeRowlayout] = guiLayout.Row();
            const roundTimeLabel = new QLabel();
            roundTimeLabel.setText('Czas trwania rundy [s]: ');
            const roundTimeInput = new QLineEdit();
            roundTimeInput.setText('10');

            roundTimeInput.addEventListener('KeyPress', (nativeEvent) => {
                const event = new QKeyEvent(nativeEvent);
                const key = event.key();
                if((key >= 48 && key <= 57) || key == 16777223 || key == 16777219){ //tylko cyfry od 0 do 9, backspace i delete
                    event.accept();
                }
                else{
                    event.ignore();
                    roundTimeInput.setEventProcessed(true);
                }
              });

            roundTimeRowlayout.addWidget(roundTimeLabel);
            roundTimeRowlayout.addWidget(roundTimeInput);

            lobbyViewLayout.addWidget(roundTimeRow);

            const startButton = new QPushButton();
            startButton.setText("rozpocznij");
            lobbyViewLayout.addWidget(startButton);
            startButton.addEventListener('clicked', () => {
                let time = parseInt(roundTimeInput.text());
                if(isNaN(time) || time <= 0 || time > 999){
                    time = 10;
                }
                this.#onStartGameCallback(time);
            });
        }
        
        lobbyViewLayout.addWidget(exitButton);


        statusRowLayout.addWidget(playerIdLabel);
        statusRowLayout.addWidget(this.serverStatusWidget.getWidget());
        statusRowLayout.addWidget(gameIdLabel);

        teamsRowLayout.addWidget(this.playerTeamList.getWidget());
        teamsRowLayout.addWidget(this.opponentTeamList.getWidget());

        //events


        exitButton.addEventListener('clicked', this.#onExitCallback);   
        changeTeamButton.addEventListener('clicked', this.#onChangeTeamCallback);

        //styling
    
        this.#rootView.setStyleSheet(`
        #rootView {
            align-items: 'center';
            justify-content: 'center';
            padding: 5px;
        }
        #lobby{
            height: '90%';
            width: '90%';
            align-items: 'center';
            justify-content: 'space-around';
        }
        #statusRow{
            width: '100%';
            height: '20%';
            justify-content: 'space-between';
        }
        #teams{
            justify-content: 'space-between';
            height: '60%';
            width: '50%';
            padding-bottom: 80px;
        }
        #starterror{
            color: red;
            width: 370px;
        }
        `);
    }

    getWidget(){
        return this.#rootView;
    }
}

module.exports = lobbyScreen;