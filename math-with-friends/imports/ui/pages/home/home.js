import './home.html';

import '../game/game.js';

Template.App_home.onCreated(function() {
  this.lobbies = [];
  this.lobbiesDep = new Tracker.Dependency;
  this.stream = new Meteor.Streamer('test');
  this.stream.on('test', (data) => {
    this.lobbies = _.toArray(data);
    this.lobbiesDep.changed();
  });
});

Template.App_home.helpers({
  getLobbies() {
    Template.instance().lobbiesDep.depend();
    console.log(Template.instance().lobbies);
    return Template.instance().lobbies;
  }
});

Template.App_home.events({
  'click .create-room'(event) {
    event.preventDefault();
    Meteor.call('createLobby', Meteor.userId());
    FlowRouter.go('/lobby');
  }
});
