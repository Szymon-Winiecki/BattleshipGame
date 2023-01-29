const { QLabel } = require("@nodegui/nodegui");
const GuiWidget = require("./guiWidget");
const guiLayout = require("./guiLayout");


class ServerStatusWidget extends GuiWidget{

  #mainView;
  #statusLabel;
  #addrLabel;

  constructor(){
    super();

    const [serverStatusView, serverStatusLayout] = guiLayout.Row("serverStatusView");
    this.#statusLabel = new QLabel();
    this.#addrLabel = new QLabel();

    serverStatusLayout.addWidget(this.#statusLabel);
    serverStatusLayout.addWidget(this.#addrLabel);

    this.#mainView = serverStatusView;

    this.updateStyle();
  }


  updateStyle(){
    this.#mainView.setStyleSheet(`
    #serverStatusView {
      width: 200px;
      align-items: 'center';
      justify-content: 'space-between';
      padding: 5px;
      flex-direction: 'row';
      flex-wrap: 'wrap';
    }
  `);
  }

  setStatus(connected){
    if(connected){
        this.#statusLabel.setText('połaczono z :');
    }
    else{
        this.#statusLabel.setText('błąd połączenia');
    }
  }

  setAddress(addr, port){
    this.#addrLabel.setText(`${addr}:${port}`);
  }

  getWidget(){
    return this.#mainView;
  }

}

module.exports = ServerStatusWidget;