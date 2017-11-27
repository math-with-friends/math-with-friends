import './channel.html';

import '../game/game.js';

Template.channel.onCreated(function() {
  this.lobbiesList = [];
  this.lobbiesListDep = new Tracker.Dependency;

  this.chatList = [];
  this.chatListDep = new Tracker.Dependency;

  this.stream = new Meteor.Streamer('test');

  this.stream.on('test', (data) => {
    this.lobbies = _.toArray(data);
    this.lobbiesListDep.changed();
  });

  this.stream.on('channel-chat', (userId, message) => {
    this.chatList.push({userId: userId, message: message});
    this.chatListDep.changed();
  });
});

Template.channel.onDestroyed(function() {
  if (this.stream) {
    delete Meteor.StreamerCentral.instances['test'];
    this.stream = null;
  }
});

Template.channel.helpers({
  getLobbies() {
    Template.instance().lobbiesListDep.depend();
    return Template.instance().lobbiesList;
  },

  getChatList() {
    Template.instance().chatListDep.depend();
    return Template.instance().chatList;
  }
});

Template.channel.events({
  'click .create-lobby'(event) {
    event.preventDefault();
    Meteor.call('createLobby', Meteor.userId(), (err, res) => {
      if (res) {
        Session.set('template', 'lobby');
      } else {
        console.log('Cannot join this lobby.');
      }
    });
  },

  'click .join-lobby'(event, instance) {
    event.preventDefault();
    Meteor.call('joinLobby', this.id, Meteor.userId(), (err, res) => {
      if (res) {
        Session.set('template', 'lobby');
      } else {
        console.log('Cannot join this lobby.');
      }
    });
  },

  'keypress .ui.input input'(event, instance) {
    const input = $('.ui.input input');
    if (event.which === 13) {
      Meteor.call('chatChannel', Meteor.userId(), input.val());
      input.val('');
    }
  },
});
