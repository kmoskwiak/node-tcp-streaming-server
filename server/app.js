var http = require('http');
var net = require('net');
var path = require('path');
var express = require('express');
var app = express();
var WebSocketServer = require('websocket').server;

var firstPacket = [];

var options = {
    root: path.resolve(__dirname, '../client/'),
    httpPort: 8080,
    tcpPort: 9090
};

// Send static files with express
app.use(express.static(options.root)); 

/** All ws clients */
var wsClients = [];

/**
 * Send index.html over http
 */
app.get('/', function(req, res){
  res.sendFile('index.html', options);
});

/** HTTP server */
var server = http.createServer(app);
server.listen(options.httpPort);

/** TCP server */
var tcpServer = net.createServer(function(socket) {
    socket.on('data', function(data){

      /**
       * We are saving first packets of stream. These packets will be send to every new user.
       * This is hack. Video won't start whitout them.  
       */
      if(firstPacket.length < 3){ 
        console.log('Init first packet', firstPacket.length);
        firstPacket.push(data); 
      }

      /**
       * Send stream to all clients
       */
      wsClients.map(function(client, index){
        client.sendBytes(data);
      });
    });
});

tcpServer.listen(options.tcpPort, 'localhost');


/** Websocet */
var wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

wsServer.on('request', function(request) {
  var connection = request.accept('echo-protocol', request.origin);
  console.log((new Date()) + ' Connection accepted.');

  if(firstPacket.length){
    /**
     * Every user will get beginnig of stream 
    **/ 
    firstPacket.map(function(packet, index){
      connection.sendBytes(packet); 
    });
    
  }
    
  /**
   * Add this user to collection
   */
  wsClients.push(connection);

  connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});