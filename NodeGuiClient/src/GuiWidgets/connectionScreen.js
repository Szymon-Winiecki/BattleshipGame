const { QLabel, FlexLayout, QWidget, QLineEdit, QPushButton } = require("@nodegui/nodegui");

const GuiScreen = require("./guiScreen");
const guiLayout = require("./guiLayout");

class ConnectionScreen extends GuiScreen{
    #rootView;

    #onConnectCallback;
    #onExitCallback;

    constructor(onConnectCallback, onExitCallback){
        super();

        this.#onConnectCallback = onConnectCallback;
        this.#onExitCallback = onExitCallback;

        this.#init();
    }

    #init(){
        //root view
        this.#rootView = new QWidget();
        const rootViewLayout = new FlexLayout();
        this.#rootView.setLayout(rootViewLayout);
        this.#rootView.setObjectName("rootView");
    
        //connection configuration layout
    
        const [connConfWidget, connConfLayout] = guiLayout.Column('connConfWidget');
        const [addrInputRow, addrInputRowLayout] = guiLayout.Row();
        const [portInputRow, portInputRowLayout] = guiLayout.Row();
    
        //connection configurtation widgtes
    
        const connConfTitleLabel = new QLabel();
        connConfTitleLabel.setText("Połącz z serwerem");
        connConfTitleLabel.setObjectName("connConfTitleLabel");
    
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

        const exitButton = new QPushButton();
        exitButton.setText("Wyjdź");
        exitButton.setObjectName("exitButton");
    
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
        connConfLayout.addWidget(exitButton);
        connConfLayout.addWidget(loadingLabel);
    
        //events
    
        connectButton.addEventListener('clicked', () => {
            const addr = addrInput.text();
            const port = parseInt(portInput.text());
            loadingLabel.setText("Łączenie...");

            this.#onConnectCallback(addr, port);
        });

        exitButton.addEventListener('clicked', this.#onExitCallback);
    
        //styling
    
        this.#rootView.setStyleSheet(`
        #rootView {
            width: '100%';
            align-items: 'center';
            justify-content: 'center';
            padding: 5px;
        }
        #connConfWidget{
            width: '200px';
            align-items: 'center';
        }
        #row{
            width: '100%';
            justify-content: 'space-between';
        }
        #connConfTitleLabel{
            margin-bottom: '10px';
            font-weight: 600;
        }
        #connectButton, #exitButton{
            width: '100%';
            margin-top: '10px'
        }
        #loadingLabel{
            margin-top: 10px;
            width:70%;
        }
        `);
    }

    getWidget(){
        return this.#rootView;
    }
}

module.exports = ConnectionScreen;