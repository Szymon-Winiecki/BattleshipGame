var net = require('net');
var Message = require('./message').Message;
var MessageType = require('./message').MessageType;

var player = require('./player').player;

var client = new net.Socket();



function connect(addr, port, callback){
    client.connect(port, addr, () => {
        console.log('CONNECTED TO: ' + addr + ':' + port);
        callback();
      });
}

function disconnect(){
  client.destroy();
}

function send(message){
  client.write(message.encode());
}

client.on('error', (error) => {
      console.log('ERROR: ' + error);
})

client.on('data', function(data) {

  var data1 = data.toString().split('}');
  data1.pop(); //usuwa ostatnią (pustą) wiadomość

  let message = new Message();
  let i = 0;
  while (i < data1.length) {
    message = message.decode(data1[i]);
    console.log("typ: "+message.getType());
    i++;
    switch(message.getType()){ 
      case MessageType.INFO: 
        console.log(message.getParam1());
      break;
      case MessageType.ERROR: 
        console.log(message.getParam1());
      break;
      case MessageType.SERVERERROR:
        console.log(message.getParam1());
        return -2; //rozlacz z serwerem nw czy to tu dziala, nietestowane
      break;
       /*
      MessageType.CREATE - informuje o grze ktora stworzylismy, jest odpowiedzia na wyslana od nas do serwera wiadomosc typu CREATE
      Dostajemy informacje o:
       ID gracza               (param1) 
       ID druzyny              (param2)
       ID gry                  (objecttype)
      */
      case MessageType.CREATE: 

        console.log("Udalo sie stworzyc gre o id: "+message.getObjectId());

        player.setGameId(message.getObjectId());
        player.setPlayerid(message.getParam1());
        player.setTeamId(parseInt(message.getParam2()));
        player.addPlayerToTeam(message.getParam2(),player.getPlayerid());

      break;
      /*
      MessageType.JOIN - informuje o grze do ktorej dolaczylismy, jest odpowiedzia na wyslana od nas do serwera wiadomosc typu JOIN
      Dostajemy informacje o:
       ID gracza               (param1) 
       ID druzyny              (param2)
       ID gry                  (objecttype)
      */
      case MessageType.JOIN:

        console.log("dolaczono do gry "+message.getObjectId());

        player.setGameId(message.getObjectId());
        player.setPlayerid(message.getParam1());
        player.setTeamId(parseInt(message.getParam2()));
        //tutaj nie dodajemy nas do druzyny dlatego ze w momencie dolaczenia dostajemy druga wiadomosc z serwera(SHOWTEAMS) o graczach w grze i ona nas zawiera
        
      break;
       /*
      MessageType.SHOWTEAMS - informuje o graczach w grze do ktorej dolaczylismy, jest odpowiedzia na wyslana od nas do serwera wiadomosc typu JOIN, ale moze byc tez uzywana osobno
      Dostajemy informacje o:
       lista z ID graczy       (param2) 
       ID druzyny              (param1)
       ID gry                  (objecttype)
       jedna wiadomosc typu SHOWTEAMS przesyla informacje na temat JEDNEJ druzyny
      */
      case MessageType.SHOWTEAMS: //przesyla po kolei druzyne 0 i potem 1

          console.log(message.getParam1());
          console.log(message.getParam2());

          //umieszczamy id graczy w liscie, mozliwe ze da sie to prosciej
          var players = message.getParam2().split(' '); 
          players.pop(); //usuniecie ostatniego bo pusty przez split

          //dodajemy tych graczy do player.teams
          if(players.length>0){
            for(let i=0;i<players.length;i++){
                player.addPlayerToTeam(parseInt(message.getParam1()),players[i]);
            }
          }
      break;
       /*
      MessageType.LEAVE - informuje o naszym opuszczeniu gry, jest odpowiedzia na wyslana od nas do serwera wiadomosc typu LEAVE
      Dostajemy informacje o: 
      tekst o opuszczeniu gry  (param1) //do zmiany pewnie
      */
      case MessageType.LEAVE: 
        console.log(message.getParam1());

        player.clear();
        
      break;
      /*
      MessageType.PLAYERLEFT - informuje o graczu ktory odszedl z naszej gry
      Dostajemy informacje o:
       ID gracza               (param1) 
       ID druzyny w jakiej byl (param2)
       ID gry                  (objecttype)
      */
      case MessageType.PLAYERLEFT:
        console.log("Gracz "+message.getParam1()+" opuscil gre");
        //usun z teams
        player.removePlayerFromTeam(parseInt(message.getParam2()),message.getParam1());
      break;
      /*
      MessageType.PLAYERJOINED - informuje o graczu ktory dolaczyl do naszej gry
      Dostajemy informacje o:
       ID gracza                     (param1)
       ID druzyny do jakiej dolaczyl (param2)
       ID gry                        (objecttype)
      */
      case MessageType.PLAYERJOINED: 
        console.log("Gracz "+message.getParam1()+" dolaczyl do gry");
        
        //dodaj do teams
        player.addPlayerToTeam(parseInt(message.getParam2()),message.getParam1());
        
      break;
       /*
      MessageType.CHANGETEAM - informuje o zmianie druzyny jakiegos gracza (jeszcze nie przetestowane)
      Dostajemy informacje o:
       ID gracza                    (param1) 
       ID druzyny na jaka zmieniamy (param2)
       ID gry                       (objecttype)
      */
      case MessageType.CHANGETEAM: //nie dziala bo nie dziala removePlayerFromTeam
        //usun z teams
        console.log(data1[i])
        player.removePlayerFromTeam(Math.abs(parseInt(message.getParam2())-1),message.getParam1());
        //dodaj do teams
        player.addPlayerToTeam(parseInt(message.getParam2()),message.getParam1());
        if(message.getParam1()===player.getPlayerid()){
          player.setTeamId(parseInt(message.getParam2()));
          console.log("Zmieniles druzyna na "+message.getParam2());
        }
        else console.log("Gracz " +message.getParam1()+ " zmienil druzyna na "+message.getParam2());
        console.log("Team 0: "+player.getTeam(0));
        console.log("Team 1: "+player.getTeam(1));
        
      break;
      /*MessageType.GETMAP - zwraca mape */
      case MessageType.GETMAP: 
        console.log(message.getParam1());
      break;
      case MessageType.VOTERESULT:
        //votingid|team|result
      break;
      case MessageType.NEXTROUND:
        //votingid|team|endTime
      break;
      default:
        console.log("incorrect message, albo jeszcze nie ustawiona\n");
      break;
  }
  }
});

client.on('close', () => {
  console.log('Connection closed');
});





module.exports = {
    connect,
    disconnect,
    send
}