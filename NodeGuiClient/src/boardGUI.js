const { QLabel, FlexLayout, QWidget, QMainWindow, QLineEdit, QPushButton } = require("@nodegui/nodegui");
const Board = require("./board");

function drawBoard(board, fieldSize, onClickCallback){
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
}

module.exports = {
  drawBoard
}