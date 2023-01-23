const { QLabel, FlexLayout, QWidget, QMainWindow, QLineEdit, QPushButton } = require("@nodegui/nodegui");
const GuiWidget = require("./guiWidget");
const Board = require("../board");


class PlayersListWidget extends GuiWidget{

  #playersListView;
  #playersListViewLayout;
  #titleLabel;

  #players;


  // board - obiekt klasy Board reprezentujacy planszę do wyświetlenia, interactive - czy można na niej głosować (tylko na planszy przeciwnika można głosować)
  constructor(){
    super();

    this.#players = [];

    this.#playersListView = new QWidget();
    this.#playersListViewLayout = new FlexLayout();
    this.#playersListView.setLayout(this.#playersListViewLayout);
    this.#playersListView.setObjectName("playersListView");

    this.#titleLabel = new QLabel();
    this.#titleLabel.setObjectName('listTitle');

    this.#playersListViewLayout.addWidget(this.#titleLabel);

    this.updateStyle();
  }
  
  updateList(){

    const prevChildred = this.#playersListViewLayout.children();
    for(let i = 1; i < prevChildred.length; ++i){
      this.#playersListViewLayout.removeWidget(prevChildred[i]);
    }
    
    for(let i = 0; i < this.#players.length; ++i){
      console.log(this.#players[i]);
      const playerLabel = new QLabel();
      playerLabel.setText(`${i + 1}.  ${this.#players[i]}`);
      this.#playersListViewLayout.addWidget(playerLabel);
    }

    this.updateStyle();
  }

  updateStyle(){
    this.#playersListView.setStyleSheet(`
    #playersListView {
      width: 140px;
      align-items: 'left';
      justify-content: 'flex-start';
      padding: 5px;
      flex-direction: 'column';
      flex-wrap: 'wrap';

      border: 1px dashed black;
      margin-left: 1px;
    }
    #listTitle{
      width: '100%';
      font-weight: 600;
    }
  `);
  }

  setList(players){
    
    this.#players = players;

    this.updateList();
  }

  setTitle(title){
    this.#titleLabel.setText(title);
  }

  getWidget(){
    return this.#playersListView;
  }

}

module.exports = PlayersListWidget;