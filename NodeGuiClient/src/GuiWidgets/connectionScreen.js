const { QLabel, FlexLayout, QWidget, QMainWindow, QLineEdit, QPushButton } = require("@nodegui/nodegui");

const GuiScreen = require("./guiScreen");
const guiLayout = require("./guiLayout");

class ConnectionScreen extends GuiScreen{
    #rootView;

    #onConnectCallback;

    constructor(onConnectCallback){
        super();

        this.#onConnectCallback = onConnectCallback;

        this.#init();
    }

    #init(){
        //root view
        this.#rootView = new QWidget();
        const rootViewLayout = new FlexLayout();
        this.#rootView.setLayout(rootViewLayout);
        this.#rootView.setObjectName("rootView");
    
        //connection configuration layout
    
        const [connConfWidget, connConfLayout] = guiLayout.Column();
        const [addrInputRow, addrInputRowLayout] = guiLayout.Row();
        const [portInputRow, portInputRowLayout] = guiLayout.Row();
    
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
            loadingLabel.setText("Łączenie...");

            this.#onConnectCallback(addr, port);
        });
    
        //styling
    
        this.#rootView.setStyleSheet(`
        #rootView {
            width: 100%;
            align-items: 'center';
            justify-content: 'center';
            padding: 5px;
        }
        #connectButton {
            width: 120px;
        }
        `);
    }

    getWidget(){
        return this.#rootView;
    }
}

module.exports = ConnectionScreen;