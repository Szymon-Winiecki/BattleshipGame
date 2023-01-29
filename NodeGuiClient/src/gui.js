const {QMainWindow} = require("@nodegui/nodegui");

const ConnectionScreen = require("./GuiWidgets/connectionScreen");
const MenuScreen = require("./GuiWidgets/menuScreen");

const GameScreen = require("./GuiWidgets/gameScreen");
const lobbyScreen = require("./GuiWidgets/lobbyScreen");


class Gui{
    #win;

    constructor(){
        this.init();
    }

    //tworzy puste okno
    init(){
        this.#win = new QMainWindow();
        this.#win.setWindowTitle('Battleship');
        this.#win.resize(1000, 600);

        this.#win.show();
    }

    /* wyświetla ekran z formularzem połączenia do serwera
     * argumenty:
     *  onConnectCallback - funkcja która ma zostać wywołana po kliknięciu przycisku 'połącz', powinna przyjmować dwa argumenty: adres i port
     * zwraca obeikt typu ConnectionScreen
     */
    showConnectScreen(onConnectCallback, onExitCallback){
        const screen = new ConnectionScreen(onConnectCallback, onExitCallback);
        this.#win.setCentralWidget(screen.getWidget());
        return screen;
    }

    /* wyświetla ekran menu z którego można stworzyć grę, dołączyć do gry, albo wyjść z aplikacji
     * argumenty:
     *  onCreateCallback - funkcja do wywołania po kliknięciu w przycisk 'nowa gra', nie powinna przyjmować argumentów
     *  onJoinCallback - funkcja do wywołania po kliknięciu w przycisk 'dołącz do gry', powinna przyjmować jeden argument - id gry
     *  onChangeServerCallback - funkcja do wywołania po kliknięciu w przycisk 'zmień serwer', nie powinna przyjmować argumentów
     *  onExitCallback - funkcja do wywołania po kliknięciu w przycisk 'wyjdź', nie powinna przyjmować argumentów
     * zwraca obeikt typu MenuScreen
     */
    showMenuScreen(onCreateCallback, onJoinCallback, onChangeServerCallback, onExitCallback){
        const screen = new MenuScreen(onCreateCallback, onJoinCallback, onChangeServerCallback, onExitCallback);
        this.#win.setCentralWidget(screen.getWidget());
        return screen;
    }

    /* wyświetla ekran lobby
     * argumenty:
     *  gameId - id gry
     *  onExitCallback - funkcja do wywołania po kliknięciu w przycisk 'opuść rozgrywkę', nie powinna przyjmować argumentów
     *  onChangeTeamCallback - funkcja do wywołania po kliknięciu w przycisk 'zmień drużynę'
     *  onStartGameCallback - funkcja do wywołanie po kliknięciu 'rozpocznij' lub 'gotowość'
     * zwraca obiekt typu LobbyScreen
     */
    showLobbyScreen(gameId, playerId, isOwner, onExitCallback, onChangeTeamCallback, onStartGameCallback){
        const screen = new lobbyScreen(gameId, playerId, isOwner, onExitCallback, onChangeTeamCallback, onStartGameCallback);
        this.#win.setCentralWidget(screen.getWidget());
        return screen;
    }

    /* wyświetla ekran gry
     * argumenty:
     *  gameId - id gry
     *  playerId - id gracza
     *  onVoteCallabck - funkcja do wywołania po kliknięciu w przycisk 'zagłosuj', powinna przyjmować dwa argumenty: x i y pola
     *  onExitCallback - funkcja do wywołania po kliknięciu w przycisk 'opuść rozgrywkę', nie powinna przyjmować argumentów
     * zwraca obeikt typu GameScreen
     */
    showGameScreen(gameId, playerId, onVoteCallabck, onExitCallback){
        const screen = new GameScreen(gameId, playerId, onVoteCallabck, onExitCallback)
        this.#win.setCentralWidget(screen.getWidget());
        return screen;
    }
}

module.exports = Gui;