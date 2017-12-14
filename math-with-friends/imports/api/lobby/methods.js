import Lobby from './lobby.js';
import { Random } from 'meteor/random';

Meteor.methods({
  createLobby(userId, userName) {
    const lobbyId = Random.id();
    const lobby = new Lobby(lobbyId);

    // addPlayer(userId) returns true if player can be added, returns false otherwise.
    if (lobby.addPlayer(userId, userName)) {
      Meteor.users.update({_id: userId}, {$set: {'profile.lobbyId': lobbyId}});
      return true;
    }

    return false;
  },

  joinLobby(lobbyId, userId, userName) {
    const lobby = lobbies[lobbyId];

    // addPlayer(userId) returns true if player can be added, returns false otherwise.
    if (lobby.addPlayer(userId, userName)) {
      Meteor.users.update({_id: userId}, {$set: {'profile.lobbyId': lobbyId}});
      return true;
    };

    return false;
  },

  checkLobbyStatus(lobbyId) {
    const lobby = lobbies[lobbyId];
    if (!lobby) {
      return false;
    }

    return true;
  },

  chatLobby(lobbyId, userId, userName, message) {
    const lobby = lobbies[lobbyId];
    if (!lobby) {
      throw new Meteor.Error('lobby-nonexistent', "Cannot chat in a lobby that doesn't exist. Lobby ID: " + lobbyId);
    }

    lobby.chat(userId, userName, message);
  },

  pingLobby(lobbyId, userId) {
    const lobby = lobbies[lobbyId];

    lobby.ping(userId);
  },

  toggleReady(lobbyId, userId) {
    const lobby = lobbies[lobbyId];

    lobby.toggleReady(userId);
  }

  // signalGo() {
  //   const lobby = lobbies[lobbyId];
  //
  //   lobby.startGame(lobbyId);
  // }
});