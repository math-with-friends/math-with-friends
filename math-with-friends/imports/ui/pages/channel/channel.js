import './channel.html';
import './channel.css';

import '../game/game.js';

Template.channel.onCreated(function() {
  this.lobbyList = [];
  this.lobbyListDep = new Tracker.Dependency;

  this.chatList = [];
  this.chatListDep = new Tracker.Dependency;

  this.userList = [];
  this.userListDep = new Tracker.Dependency;

  this.stream = new Meteor.Streamer('test');

  this.stream.on('test', (data) => {
    this.lobbyList = _.toArray(data);
    this.lobbyListDep.changed();
  });

  this.stream.on('users-online', (users) => {
    this.userList = users;
    this.userListDep.changed();
  })

  this.stream.on('channel-chat', (userId, userName, message) => {
    this.chatList.push({userName: userName, message: message});
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
    Template.instance().lobbyListDep.depend();
    return Template.instance().lobbyList;
  },

  getChatList() {
    Template.instance().chatListDep.depend();
    return Template.instance().chatList;
  },

  getUserList() {
    Template.instance().userListDep.depend();
    return Template.instance().userList;
  },

  getUsername() {
    return Meteor.user().profile.userName;
  },

  getIconId() {
    return Meteor.user().profile.iconId;
  },

  isHelperVisible() {
    if (Session.get('helper')) {
      return 'visible';
    } else {
      return 'not-visible';
    }
  }
});

Template.channel.events({
  'click #create-lobby-button'(event) {
    event.preventDefault();
    Meteor.call('createLobby', Meteor.userId(), Meteor.user().profile.userName, (err, res) => {
      if (res) {
        Session.set('template', 'lobby');
      } else {
        console.log('Cannot join this lobby.');
      }
    });
  },

  'click .join-lobby'(event, instance) {
    event.preventDefault();
    Meteor.call('joinLobby', this.id, Meteor.userId(), Meteor.user().profile.userName, (err, res) => {
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
      Meteor.call('chatChannel', Meteor.userId(), Meteor.user().profile.userName, input.val());
      input.val('');
    }
  },

  'click #edit-profile-button'(event, instance) {
    event.preventDefault();
    Session.set('template', 'profile');
  }
});
