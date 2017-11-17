import Game from '../../api/game/game.js'
import socket_io from 'socket.io';

io = null;
games = {}

Meteor.startup(() => {
  new Game('test-game');

  io = socket_io(8080);

  io.on('connection', function(socket) {
    console.log('new socket client');

    socket.on('disconnect', () => {
      console.log('disconnected!');
    })
  });
})