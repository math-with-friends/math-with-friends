import './home.html';

import '../game/game.js';

Template.App_home.events({
  'click .join-game'(event) {
    event.preventDefault();
    Meteor.call('joinGame', 'test-game', Meteor.userId(), Meteor.user().profile.socketId);
  }
});
