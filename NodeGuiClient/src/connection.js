var net = require('net');
var Message = require('./message').Message;
var MessageType = require('./message').MessageType;
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
  client.write(message);
}





client.on('error', (error) => {
      console.log('ERROR: ' + error);
})

client.on('data', function(data) {
  var bread = client.bytesRead;
  console.log('Bytes read : ' + bread);
  console.log('Data read: ' + data);
  var data1 = data.toString().split('}'); //zrobic jakos inaczej split bo zostawia na koncu pusta "" wiadomosc

  let message = new Message();
  let i = 0;
  while (i < data1.length) {
    message = message.decode(data1[i]);
    console.log(message.getType());
    i++;
    switch(message.getType()){ 
      case MessageType.INFO: 
        console.log(message.getParam1());
      break;
      case MessageType.ERROR: 
        console.log(message.getParam1());
      break;
      case MessageType.CREATE: 
        console.log(message.getParam2());
      break;
      case MessageType.JOIN:
        console.log(message.getParam2());
      break;
      case MessageType.SHOWTEAMS: 
          console.log(message.getParam1());
          console.log(message.getParam2());
      break;
      case MessageType.LEAVE: 
        console.log(message.getParam1());
      break;
      case MessageType.GETMAP: 
        console.log(message.getParam1());
      break;
      default:
        console.log("incorrect message\n");
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