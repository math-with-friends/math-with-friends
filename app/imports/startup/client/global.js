import io from 'socket.io-client';

// socket = null;

Meteor.startup(() => {
  Session.set('template', 'landing');

  Accounts.onLogin(() => {
    console.log('onLogin');
    const gameId = Meteor.user().profile.gameId;
    const userId = Meteor.userId();

    Session.set('template', 'channel');
  });

  Accounts.onLogout(() => {
    console.log('onLogout');
    Session.set('template', 'landing');
  });
});

