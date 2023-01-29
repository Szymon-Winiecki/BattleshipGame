var net = require('net');
var Message = require('./message').Message;

class Connection{
  #socket;

  onConnectCallback;
  onMessageCallback;
  onErrorCallback;
  onCloseCallback;


  constructor(onConnectCallback, onMessageCallback, onErrorCallback, onCloseCallback){

    this.onConnectCallback = onConnectCallback;
    this.onMessageCallback = onMessageCallback;
    this.onErrorCallback = onErrorCallback;
    this.onCloseCallback = onCloseCallback;
    
    this.#socket = new net.Socket();

    this.#socket.on('error', this.onErrorCallback);
  
    this.#socket.on('data', (data) => {

      let messages = data.toString().split('}');
      messages.pop(); //usuwa ostatnią (pustą) wiadomość
      let i = 0;
      while (i < messages.length) {
        const message = Message.decode(messages[i]);
        this.onMessageCallback(message);
        ++i;
      }
    });
  }


  connect(addr, port){
    this.#socket.connect(port, addr, () => {
      this.onConnectCallback(addr, port);
    });
  }

  disconnect(){
    this.#socket.destroy();

  }

  send(message){
    this.#socket.write(message.encode());
  }

}

module.exports = Connection;