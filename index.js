'use strict';
//////////////////////////
// const https = require('https')
var http = require('http')
const fs = require('fs')
var os = require('os');
var nodeStatic = require('node-static');
var socketIO = require('socket.io');
///////////////////////////////
var express = require('express');
// var app = express();
/////////////////////////
var multer = require('multer');

var path = require('path');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})
var upload = multer({ storage: storage })
// const router = require('./index.js');

// const options = {
//   key:fs.readFileSync('./private.pem'),
//   cert:fs.readFileSync('./public.pem')
// };



var fileServer = new(nodeStatic.Server)();
var app = http.createServer(function(req, res){
  fileServer.serve(req, res);
}).listen(3000);

console.log('Server Running at http://127.0.0.1:3000');

var io = socketIO.listen(app);
io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
    console.log(array)
  }

  socket.on('message', function(message) {
    log('Client said: ', message);
    console.log("안녕")
    // for a real app, would be room-only (not broadcast)
    socket.broadcast.emit('message', message);
  });

  socket.on('msg', (data) => {
    io.sockets.emit('msg', data);
    console.log(data);
    // var output = 'hello';
    // $(output).prependTo('#content');
    // $('#content').listview('refresh');
  });

  socket.on('image', (data)=>{
    io.sockets.emit('image', data);
    console.log(data);
  });

  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);
    console.log("create or join")
    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);

    } else if (numClients === 1) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');
    } else { // max two clients
      socket.emit('full', room);
    }
  });

  socket.on('ipaddr', function() {
    console.log("ipaddr")
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  socket.on('bye', function(){
    console.log('received bye');
  });

});