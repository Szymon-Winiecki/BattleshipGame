const { QLabel, FlexLayout, QWidget, QMainWindow, QLineEdit, QPushButton } = require("@nodegui/nodegui");
const GuiWidget = require("./guiWidget");
const Board = require("../board");


class GuiBoard extends GuiWidget{

  //properties
  #fieldSize = 20;

  //
  #board;
  #interactive;
  #onClick = (x, y) => {
    console.log(`(${x}, ${y})`);
  };

  //widgets
  #boardView;
  #boardViewLayout;
  #fieldsWidgets;


  // board - obiekt klasy Board reprezentujacy planszę do wyświetlenia, interactive - czy można na niej głosować (tylko na planszy przeciwnika można głosować)
  constructor(board, interactive){
    super();

    this.#board = board;
    this.#interactive = interactive;

    this.#boardView = new QWidget();
    this.#boardViewLayout = new FlexLayout();
    this.#boardView.setLayout(this.#boardViewLayout);
    this.#boardView.setObjectName("boardView");

    this.#fieldsWidgets = new Array(board.getSize());
        for(let i = 0; i < board.getSize(); ++i){
          this.#fieldsWidgets[i] = new Array(board.getSize());
    }

    for(let i = 0; i < board.getSize(); ++i){
      for(let j = 0; j < board.getSize(); ++j){
        this.#fieldsWidgets[j][i] = new QPushButton();
        this.#boardViewLayout.addWidget(this.#fieldsWidgets[j][i]);
        this.#fieldsWidgets[j][i].addEventListener("clicked", () => {
          if(this.#interactive && this.#fieldsWidgets[j][i].property('class') == 'clear'){ //można zagłosować tylko na pola typu 'clear' na planysz przeciwnika, więc tylko te będą uruchamiały event
            this.#onClick(j, i);
          }
        });
      }
    }

    this.updateFields();
    this.updateStyle();
  }


  //do wywołania przy każdej zmianie statusu pola przypisuje odpowiednie klasy wszystkim polom, żeby się odpowiednio kolorowały (być może trzeba będzie potem wywołać updateStyle() - do sprawdzenia)
  updateFields(){
    for(let i = 0; i < this.#board.getSize(); ++i){
      for(let j = 0; j < this.#board.getSize(); ++j){
        const status = this.#board.getStatus(j, i);
        if(status == Board.FieldStatus.CLEAR){
          this.#fieldsWidgets[j][i].setProperty("class", "clear");
        }
        else if(status == Board.FieldStatus.SHIP){
          this.#fieldsWidgets[j][i].setProperty("class", "ship");
        }
        else if(status == Board.FieldStatus.MISS){
          this.#fieldsWidgets[j][i].setProperty("class", "miss");
        }
        else if(status == Board.FieldStatus.HIT){
          this.#fieldsWidgets[j][i].setProperty("class", "hit");
        }
        else if(status == Board.FieldStatus.SUNK){
          this.#fieldsWidgets[j][i].setProperty("class", "sunk");
        }
      }
    }
  }

  updateStyle(){
    this.#boardView.setStyleSheet(`
    #boardView {
      width: ${this.#board.getSize() * this.#fieldSize + 10}px;
      align-items: 'center';
      justify-content: 'center';
      padding: 5px;
      flex-direction: 'row';
      flex-wrap: 'wrap';
    }
    #boardView > QPushButton{
      width: ${this.#fieldSize}px;
      height: ${this.#fieldSize}px;
    }
    #boardView > QPushButton.clear{
      background-color: blue;
    }
    #boardView > QPushButton.ship{
      background-color: green;
    }
    #boardView > QPushButton.miss{
      background-color: grey;
    }
    #boardView > QPushButton.hit{
      background-color: darkred;
    }
    #boardView > QPushButton.sunk{
      background-color: black;
    }
    ${this.#interactive ? '' : '#boardView > QPushButton.clear:hover{ border: 1px solid black; }'}  //można wybrać głosować tylko na pola typu 'clear' na planszy przeciwnika, więc nie tylke te będą reagować na najechanie lub kliknięcie
    ${this.#interactive ? '' : '#boardView > QPushButton.clear:focus{ border: 1px solid black; }'}
  `);
  }

  // ustawia rozmiar (szerokość i wysokość) pojedynczego pola w px
  setFieldSize(size){
    this.#fieldSize = size;
    this.updateStyle();
  }

  // ustawia funkcję jaka ma być wywołana po kliknięcu w pol, powinna przyjmować dwa argumenty - x i y kliknietgo pola
  setOnClick(callback){
    this.#onClick = callback;
  }

  getWidget(){
    return this.#boardView;
  }

}

module.exports = GuiBoard;