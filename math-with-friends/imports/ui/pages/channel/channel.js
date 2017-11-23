import './channel.html';

import '../game/game.js';

Template.channel.onCreated(function() {
  this.lobbies = [];
  this.lobbiesDep = new Tracker.Dependency;
  this.stream = new Meteor.Streamer('test');
  this.stream.on('test', (data) => {
    this.lobbies = _.toArray(data);
    this.lobbiesDep.changed();
  });
});

Template.channel.onDestroyed(function() {
  if (this.stream) {
    delete Meteor.StreamerCentral.instances['test'];
    this.stream = null;
  }
})

Template.channel.helpers({
  getLobbies() {
    Template.instance().lobbiesDep.depend();
    console.log(Template.instance().lobbies);
    return Template.instance().lobbies;
  }
});

Template.channel.events({
  'click .create-lobby'(event) {
    event.preventDefault();
    Meteor.call('createLobby', Meteor.userId());
    Session.set('template', 'lobby');
  },

  'click .join-lobby'(event, instance) {
    event.preventDefault();
    Meteor.call('joinLobby', this.id, Meteor.userId());
    Session.set('template', 'lobby');
  }
});
