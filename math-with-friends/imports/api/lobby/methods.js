import Lobby from './lobby.js';
import { Random } from 'meteor/random';

Meteor.methods({
  createLobby(userId) {
    const lobbyId = Random.id();
    const lobby = new Lobby(lobbyId);

    Meteor.users.update({_id: userId}, {$set: {'profile.lobbyId': lobbyId}});
    lobby.addPlayer(userId);

    return true;
  },

  joinLobby(lobbyId, userId) {
    const lobby = lobbies[lobbyId];

    Meteor.users.update({_id: userId}, {$set: {'profile.lobbyId': lobbyId}});
    lobby.addPlayer(userId);
  },

  checkLobbyStatus(lobbyId) {
    const lobby = lobbies[lobbyId];
    if (!lobby) {
      return false;
    }

    return true;
  },

  chatLobby(lobbyId, userId, message) {
    const lobby = lobbies[lobbyId];
    if (!lobby) {
      throw new Meteor.Error('lobby-nonexistent', "Cannot chat in a lobby that doesn't exist. Lobby ID: " + lobbyId);
    }

    lobby.chat(userId, message);
  },

  pingLobby(lobbyId, userId) {
    const lobby = lobbies[lobbyId];

    lobby.ping(userId);
  },

  signalReady(lobbyId) {
    const lobby = lobbies[lobbyId];

    lobby.increaseReadyCount();
  }

  // signalGo() {
  //   const lobby = lobbies[lobbyId];
  //
  //   lobby.startGame(lobbyId);
  // }
});