const { QLabel, FlexLayout, QWidget, QMainWindow, QLineEdit, QPushButton } = require("@nodegui/nodegui");
const GuiWidget = require("./guiWidget");
const Board = require("../board");


class GuiBoard extends GuiWidget{

  //properties
  #fieldSize = 20;

  //
  #board;
  #onClick = (x, y) => {
    console.log(`(${x}, ${y})`);
  };

  //widgets
  #boardView;
  #boardViewLayout;
  #fieldsWidgets;

  constructor(board){
    super();

    this.#board = board;

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
          this.#onClick(j, i);
        });
      }
    }

    this.updateFields();
    this.updateStyle();
  }

  updateFields(){
    for(let i = 0; i < this.#board.getSize(); ++i){
      for(let j = 0; j < this.#board.getSize(); ++j){
        const status = this.#board.getStatus(j, i);
        if(status == Board.FieldStatus.CLEAR){
          this.#fieldsWidgets[j][i].setInlineStyle("background-color: blue;")
        }
        else if(status == Board.FieldStatus.SHIP){
          this.#fieldsWidgets[j][i].setInlineStyle("background-color: green;")
        }
        else if(status == Board.FieldStatus.MISS){
          this.#fieldsWidgets[j][i].setInlineStyle("background-color: grey;")
        }
        else if(status == Board.FieldStatus.HIT){
          this.#fieldsWidgets[j][i].setInlineStyle("background-color: darkred;")
        }
        else if(status == Board.FieldStatus.SUNK){
          this.#fieldsWidgets[j][i].setInlineStyle("background-color: black;")
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
  `);
  }

  setFieldSize(size){
    this.#fieldSize = size;
    this.updateStyle();
  }

  setOnClick(callback){
    this.#onClick = callback;
  }

  getWidget(){
    return this.#boardView;
  }

}


/*function drawBoard(board, fieldSize, onClickCallback){
  const boardView = new QWidget();
  const boardViewLayout = new FlexLayout();
  boardView.setLayout(boardViewLayout);
  boardView.setObjectName("boardView");
  
  for(let i = 0; i < board.getSize(); ++i){
    for(let j = 0; j < board.getSize(); ++j){
      const field = new QPushButton();
      boardViewLayout.addWidget(field);
      field.addEventListener("clicked", () => {
        onClickCallback(j, i);
      })

      const status = board.getStatus(j, i);
      if(status == Board.FieldStatus.CLEAR){
        field.setInlineStyle("background-color: blue;")
      }
      else if(status == Board.FieldStatus.SHIP){
        field.setInlineStyle("background-color: green;")
      }
      else if(status == Board.FieldStatus.MISS){
        field.setInlineStyle("background-color: grey;")
      }
      else if(status == Board.FieldStatus.HIT){
        field.setInlineStyle("background-color: darkred;")
      }
      else if(status == Board.FieldStatus.SUNK){
        field.setInlineStyle("background-color: black;")
      }
    }
  }

  boardView.setStyleSheet(`
    #boardView {
      width: ${board.getSize() * fieldSize + 10}px;
      align-items: 'center';
      justify-content: 'center';
      padding: 5px;
      flex-direction: 'row';
      flex-wrap: 'wrap';
    }
    #boardView > QPushButton{
      width: ${fieldSize}px;
      height: ${fieldSize}px;
    }
  `);

  return boardView;
}*/

module.exports = GuiBoard;