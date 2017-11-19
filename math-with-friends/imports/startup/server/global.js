import Game from '../../api/game/game.js'
import http from 'http';
import socket_io from 'socket.io';

// io = null;
games = {}

Meteor.startup(() => {
  new Game('test-game');
})