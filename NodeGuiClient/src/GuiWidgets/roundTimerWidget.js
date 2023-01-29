const { QLabel, FlexLayout, QWidget } = require("@nodegui/nodegui");
const GuiWidget = require("./guiWidget");


class RoundTimerWidget extends GuiWidget{

  static RoundType = {
    OWN: 0,
    OPPONENT: 1,
    BREAK: 2,
    WIN: 3,
    DEFEAT: 4
  }

  #endTime = 0;
  #intervalUpdater;

  //widgets
  #roundTimerView;
  #roundTimerViewLayout;
  #teamLabel;
  #timerLabel;

  constructor(){
    super();

    this.#roundTimerView = new QWidget();
    this.#roundTimerViewLayout = new FlexLayout();
    this.#roundTimerView.setLayout(this.#roundTimerViewLayout);
    this.#roundTimerView.setObjectName("roundTimerView");

    this.#teamLabel = new QLabel();
    this.#timerLabel = new QLabel();
    this.#timerLabel.setObjectName("timerLabel");

    this.#roundTimerViewLayout.addWidget(this.#teamLabel);
    this.#roundTimerViewLayout.addWidget(this.#timerLabel);

    this.updateStyle();
  }

  // ustawia czyja aktualnie jest runda - gracza czy przeciwnika
  setRound(round){
    if(round == RoundTimerWidget.RoundType.OWN){
      this.#teamLabel.setText('Twój ruch');
    }
    else if(round == RoundTimerWidget.RoundType.OPPONENT){
      this.#teamLabel.setText('przeciwnik głosuje');
    }
    else if(round == RoundTimerWidget.RoundType.BREAK){
      this.#teamLabel.setText('oczekiwanie');
    }
    else if(round == RoundTimerWidget.RoundType.WIN){
      this.disableTimerUpdate();
      this.#teamLabel.setText('Koniec gry: ');
      this.#timerLabel.setText('WYGRANA');
    }
    else if(round == RoundTimerWidget.RoundType.DEFEAT){
      this.disableTimerUpdate();
      this.#teamLabel.setText('Koniec gry: ');
      this.#timerLabel.setText('PRZEGRANA');
    }
  }

  // ustawia czas zakończenia rundy, w milisekundach od 01.01.1970
  setEndTime(endTime){
    this.#endTime = endTime;

    this.enableTimerUpdate();
  }


  // włącza funkcję, która regualrnie aktualizuje pokazany czas do zakończenia rundy
  enableTimerUpdate(){
    if(this.#intervalUpdater != undefined) return;
    this.#intervalUpdater = setInterval(() => { this.updateTimer(); }, 1000);
  }

  //wyłącza funkcję, która regualrnie aktualizuje pokazany czas do zakończenia rundy
  disableTimerUpdate(){
    if(this.#intervalUpdater == undefined) return;
    clearInterval(this.#intervalUpdater);
    this.#intervalUpdater = undefined;
  }

  // wyświetla aktualny czas do zakończenia rundy w sekundach
  updateTimer(){
    try{
      this.#timerLabel.isVisible();
    }
    catch(e){
      this.disableTimerUpdate();  //zaprzestań aktualizacji zegara, po usunięciu widgetu
      return;
    }

    if(this.#endTime != 0){
      const secondsToGo = parseInt((this.#endTime - Date.now()) / 1000);
      if(secondsToGo >= 0){
        this.#timerLabel.setText(`${secondsToGo} s`);
      }
      else{
        this.#timerLabel.setText("koniec");
      }
    }
    else{
      this.#timerLabel.setText("");
    }
  }

  updateStyle(){
    this.#roundTimerView.setStyleSheet(`
    #roundTimerView {
      width: 320px;
      align-items: 'center';
      justify-content: 'space-around';
      padding: 5px;
      flex-direction: 'row';
      flex-wrap: 'wrap';
    }
    #timerLabel{
      width: 100px;
      font-weight: 600;
    }
  `);
  }

  getWidget(){
    return this.#roundTimerView;
  }

}

module.exports = RoundTimerWidget;