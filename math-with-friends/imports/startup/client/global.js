import io from 'socket.io-client';

// socket = null;

Meteor.startup(() => {
  Session.set('template', 'channel');

  Accounts.onLogin(() => {
    const gameId = Meteor.user().profile.gameId;
    const userId = Meteor.userId();
    // const socketId = socket.id;

    // Meteor.call('handleDuplicateClients', userId, socketId);
    // Meteor.call('joinGame', gameId, userId);
    // Meteor.call('joinLobby', 'test-game', userId);
  });
});

