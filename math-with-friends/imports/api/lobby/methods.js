import Lobby from './lobby.js';
import { Random } from 'meteor/random';

Meteor.methods({
  createLobby(userId) {
    const lobbyId = Random.id();
    const lobby = new Lobby(lobbyId);

    Meteor.users.update({_id: userId}, {$set: {'profile.lobbyId': lobbyId}});
    lobby.addPlayer(userId);
  },

  joinLobby(lobbyId, userId) {
    const lobby = lobbies[lobbyId];

    lobby.addPlayer(userId);
  },

  checkLobbyStatus(lobbyId) {
    const lobby = lobbies[lobbyId];
    if (!lobby) {
      return false;
    }

    return true;
  },

  pingLobby(lobbyId, userId) {
    const lobby = lobbies[lobbyId];

    lobby.ping(userId);
  },

  signalReady(lobbyId) {
    const lobby = lobbies[lobbyId];

    lobby.increaseReadyCount();
  },

  test() {
    console.log('test');
  }

  // signalGo() {
  //   const lobby = lobbies[lobbyId];
  //
  //   lobby.startGame(lobbyId);
  // }
});