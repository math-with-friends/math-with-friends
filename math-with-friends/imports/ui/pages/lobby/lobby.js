import './lobby.html';
import './lobby.css';

Template.lobby.onCreated(function () {
  this.playersList = [];
  this.playersListDep = new Tracker.Dependency;

  this.chatList = [];
  this.chatListDep = new Tracker.Dependency;

  this.id = null;
  this.stream = null;
  this.pingHandler = null;

  Meteor.call('checkLobbyStatus', Meteor.user().profile.lobbyId, (err, res) => {
    if (res) {
      this.id = Meteor.user().profile.lobbyId;
      this.stream = new Meteor.Streamer(this.id);

      this.stream.on('lobby-players-list', (players) => {
        this.playersList = _.toArray(players);
        this.playersListDep.changed();
      });

      this.stream.on('lobby-start-game', (gameId) => {
        Meteor.call('joinGame', gameId, Meteor.userId(), () => {
          Session.set('template', 'game');
        });
      });

      this.stream.on('lobby-chat', (userId, message) => {
        this.chatList.push({userId: userId, message: message});
        this.chatListDep.changed();
      });

      this.pingHandler = Meteor.setInterval(() => {
        Meteor.call('pingLobby', this.id, Meteor.userId())
      }, 1000);
    }
  });

});

Template.lobby.onDestroyed(function () {
  if (this.stream) {
    delete Meteor.StreamerCentral.instances[this.id];
    this.stream = null;
  }
  if (this.pingHandler) {
    Meteor.clearInterval(this.pingHandler);
  }
});

Template.lobby.helpers({
  getPlayersList() {
    Template.instance().playersListDep.depend();
    return Template.instance().playersList;
  },

  getChatList() {
    Template.instance().chatListDep.depend();
    return Template.instance().chatList;
  }
});

Template.lobby.events({
  'click .ready'(event) {
    event.preventDefault();
    Meteor.call('signalReady', Template.instance().id);
  },

  'keypress .ui.input input'(event, instance) {
    const input = $('.ui.input input');
    if (event.which === 13) {
      Meteor.call('chatLobby', instance.id, Meteor.userId(), input.val());
      input.val('');
    }
  },

  'click .exit'(event) {
    event.preventDefault();
    Session.set('template', 'channel');
  }
});
