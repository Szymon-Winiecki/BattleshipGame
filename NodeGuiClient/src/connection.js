var net = require('net');

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

function send(data){
  client.write(data);
}

client.on('error', (error) => {
      console.log('ERROR: ' + error);
})

client.on('data', function(data) {
  console.log(data.toString());
});

client.on('close', () => {
  console.log('Connection closed');
});

module.exports = {
    connect,
    disconnect,
    send
}