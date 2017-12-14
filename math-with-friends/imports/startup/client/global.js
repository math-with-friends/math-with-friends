import io from 'socket.io-client';

// socket = null;

Meteor.startup(() => {
  Session.set('template', 'landing');

  Accounts.onLogin(() => {
    console.log('onLogin');

    Meteor.call('loginChannel', Meteor.userId());

    Session.set('template', 'channel');
  });

  Accounts.onLogout(() => {
    console.log('onLogout');

    Meteor.call('logoutChannel', Meteor.userId());

    Session.set('template', 'landing');
  });
});

