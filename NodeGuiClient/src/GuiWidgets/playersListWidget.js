const { QLabel, FlexLayout, QWidget, QMainWindow, QLineEdit, QPushButton } = require("@nodegui/nodegui");
const GuiWidget = require("./guiWidget");
const Board = require("../board");


class PlayersListWidget extends GuiWidget{

  #playersListView;
  #playersListViewLayout;
  #titleLabel;
  #playersLabels = [];

  #players;
  #title = '';


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

    this.#titleLabel.delete();
    for(let i = 0; i < this.#playersLabels.length; ++i){
      this.#playersListViewLayout.removeWidget(this.#playersLabels[i]);
      this.#playersLabels[i].setInlineStyle(`width: '0px'`);
      this.#playersLabels[i].setText("");
    }

    this.#playersLabels = new Array(this.#players.length);

    this.#titleLabel = new QLabel();
    this.#titleLabel.setObjectName('listTitle');
    this.#titleLabel.setText(this.#title);

    this.#playersListViewLayout.delete();
    this.#playersListViewLayout = new FlexLayout();
    this.#playersListView.setLayout(this.#playersListViewLayout);
    this.#playersListViewLayout.addWidget(this.#titleLabel);
    
    for(let i = 0; i < this.#players.length; ++i){
      this.#playersLabels[i] = new QLabel();
      this.#playersLabels[i].setText(`${i + 1}.  ${this.#players[i]}`);
      //this.#playersLabels[i].setInlineStyle(`background-color:'white'; width: '100%'`);
      this.#playersListViewLayout.addWidget(this.#playersLabels[i]);
    }

    this.updateStyle();
  }

  updateStyle(){
    this.#playersListView.setStyleSheet(`
    #playersListView {
      width: 140px;
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
    this.#title = title;
    this.#titleLabel.setText(title);
  }

  getWidget(){
    return this.#playersListView;
  }

}

module.exports = PlayersListWidget;