import Game from '../../api/game/game.js';
import Lobby from '../../api/lobby/lobby.js';
import http from 'http';
import socket_io from 'socket.io';

// io = null;
games = {};
lobbies = {};

Meteor.startup(() => {
  // new Lobby('test-game');
  // new Game('test-game');
  const stream = new Meteor.Streamer('test');
  stream.allowRead('all');
  Meteor.setInterval(() => {
    stream.emit('test', _.map(lobbies, (lobby) => {return lobby.id}));

    _.each(lobbies, (lobby) => {
      if (lobby.state == 3) {
        lobby.cleanUp();
        delete lobbies[lobby.id];
      }
    });
  }, 3000);
})