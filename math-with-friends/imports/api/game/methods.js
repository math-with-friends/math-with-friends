Meteor.methods({
  createGame(gameId) {

  },
  deleteGame(gameId) {

  },
  checkGameStatus(gameId) {
    const game = games[gameId];
    if (!game) {
      return false;
    }

    return true;
  },

  getPlayerPosition(gameId, userId) {
    const game = games[gameId];
    if (!game) {
      throw new Meteor.Error('game-nonexistent', "Cannot talk to a game that doesn't exist. Game ID: " + gameId);
    }

    return game.getPlayerPosition(userId);
  },

  sendPlayerPosition(gameId, userId, x, y) {
    const game = games[gameId];
    if (!game) {
      throw new Meteor.Error('game-nonexistent', "Cannot talk to a game that doesn't exist. Game ID: " + gameId);
    }

    const players = game.getPlayers();
    if (!players[userId]) {
      throw new Meteor.Error('game-player', 'Cannot find such player. User ID: ' + userId);
    }
    game.modifyPlayer(userId, x, y);
  },

  pingGame(gameId, userId) {
    const game = games[gameId];

    game.ping(userId);
  },

  joinGame(gameId, userId) {
    console.log('joinGame called', gameId, userId);
    const game = games[gameId];
    if (!game) {
      throw new Meteor.Error('game-nonexistent', "Cannot join a game that doesn't exist. Game ID: " + gameId);
    }

    // const socket = io.sockets.connected[socketId];
    // if (socket) {
    //   socket.join(gameId);
    // }

    Meteor.users.update({_id: userId}, {$set: {'profile.gameId': gameId}});

    game.addPlayer(userId, 0, 0);
    return true;
  },
  removePlayer(gameId, userId) {
    const game = games[gameId];
    if (!game) {
      throw new Meteor.Error('game-nonexistent', "Cannot remove player from a game that doesn't exist. Game ID: " + gameId);
    }

    game.removePlayer(userId);
  },
  // handleDuplicateClients(userId, socketId) {
  //   console.log('handleDuplicateClients called', userId, socketId);
  //   const oldSocketId = Meteor.users.findOne({_id: userId}).profile.socketId;
  //   const socket = io.sockets.connected[oldSocketId];
  //   if (socket) {
  //     socket.disconnect();
  //   }
  //
  //   Meteor.users.update({_id: userId}, {$set: {'profile.socketId': socketId}});
  // }
});