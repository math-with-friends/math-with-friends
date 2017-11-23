import './lobby.html';

Template.lobby.onCreated(function () {
  this.playersList = {};
  this.playersListDep = new Tracker.Dependency;
  this.id = null;
  this.stream = null;
  this.pingHandler = null;

  this.autorun(() => {
    if (Meteor.user()) {
      Meteor.call('checkLobbyStatus', Meteor.user().profile.lobbyId, (err, res) => {
        if (res) {
          this.id = Meteor.user().profile.lobbyId;
          this.stream = new Meteor.Streamer(this.id);

          this.stream.on('lobby-players-list', (data) => {
            console.log('lobby-players-list');
            this.playersList = data;
            this.playersListDep.changed();
          });

          this.stream.on('lobby-start-game', () => {
            Session.set('template', 'game');
          });

          this.pingHandler = Meteor.setInterval(() => {
            console.log('ping');
            Meteor.call('pingLobby', this.id, Meteor.userId())
            }, 1000);
        }
      });

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
    return _.toArray(Template.instance().playersList);
  }
});

Template.lobby.events({
  'click .ready'(event) {
    event.preventDefault();
    Meteor.call('signalReady', Template.instance().id);
  },

  'click .goto'(event) {
    event.preventDefault();
    Session.set('template', 'game');
  },

  'click .exit'(event) {
    event.preventDefault();
    Session.set('template', 'channel');
  }
});
