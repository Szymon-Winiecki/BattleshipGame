const { QLabel, FlexLayout, QWidget, QMainWindow, QLineEdit, QPushButton } = require("@nodegui/nodegui");

const GuiScreen = require("./guiScreen");
const guiLayout = require("./guiLayout");
const ServerStatusWidget = require("./serverStatusWidget");

class MenuScreen extends GuiScreen{
    #rootView;
    serverStatusWidget;

    #onCreateCallback;
    #onJoinCallback;
    #onChangeServerCallback;
    #onExitCallback;

    constructor(onCreateCallback, onJoinCallback, onChangeServerCallback, onExitCallback){
        super();

        this.#onCreateCallback = onCreateCallback;
        this.#onJoinCallback = onJoinCallback;
        this.#onChangeServerCallback = onChangeServerCallback;
        this.#onExitCallback = onExitCallback;

        this.#init();
    }

    #init(){
        //root view
        this.#rootView = new QWidget();
        const rootViewLayout = new FlexLayout();
        this.#rootView.setLayout(rootViewLayout);
        this.#rootView.setObjectName("rootView");
    
        //layout
        const [menuView, menuViewLayout] = guiLayout.Column("menu");
        const [createGameRow, createGameRowLayout] = guiLayout.Row();
        const [joinGameRow, joinGameRowLayout] = guiLayout.Row();
        const [changeServerRow, changeServerRowLayout] = guiLayout.Row();
    
        this.serverStatusWidget = new ServerStatusWidget();

        const createGameLabel = new QLabel();
        createGameLabel.setText("Utwórz nową grę: ")

        const createGameButton = new QPushButton();
        createGameButton.setText("nowa gra");
    
        const joinGameLabel = new QLabel();
        joinGameLabel.setText("Dołącz do gry o id: ");
    
        const joinGameInput = new QLineEdit();
    
        const joinGameButtton = new QPushButton();
        joinGameButtton.setText("dołącz");

        const changeServerLabel = new QLabel();
        changeServerLabel.setText("Zmień serwer: ")

        const changeServerButton = new QPushButton();
        changeServerButton.setText("zmień");
    
        const exitButton = new QPushButton();
        exitButton.setText("wyjdź");
    
        //add widgets to layouts
    
        rootViewLayout.addWidget(menuView);

        createGameRowLayout.addWidget(createGameLabel);
        createGameRowLayout.addWidget(createGameButton);

        joinGameRowLayout.addWidget(joinGameLabel);
        joinGameRowLayout.addWidget(joinGameInput);
        joinGameRowLayout.addWidget(joinGameButtton);

        changeServerRowLayout.addWidget(changeServerLabel);
        changeServerRowLayout.addWidget(changeServerButton);

        menuViewLayout.addWidget(this.serverStatusWidget.getWidget());
        menuViewLayout.addWidget(createGameRow);
        menuViewLayout.addWidget(joinGameRow);
        menuViewLayout.addWidget(changeServerRow);
        menuViewLayout.addWidget(exitButton);

        //events

        createGameButton.addEventListener('clicked', () => {
            this.#onCreateCallback();
        });

        joinGameButtton.addEventListener('clicked', () => {
            const gameId = joinGameInput.text();
            this.#onJoinCallback(gameId);
        });

        changeServerButton.addEventListener('clicked', () => {
            this.#onChangeServerCallback();
        });

        exitButton.addEventListener('clicked', () => {
            this.#onExitCallback();
        });
    
        //styling
    
        this.#rootView.setStyleSheet(`
        #rootView {
            align-items: 'center';
            justify-content: 'center';
            padding: 5px;
        }
        #menu{
            height: '60%';
            justify-content: 'space-around';
        }
        `);
    }

    getWidget(){
        return this.#rootView;
    }
}

module.exports = MenuScreen;