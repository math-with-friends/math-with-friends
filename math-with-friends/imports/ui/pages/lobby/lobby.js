import './lobby.html';

Template.lobby.onCreated(function () {
  this.playersList = {};
  this.playersListDep = new Tracker.Dependency;
  this.id = null;
  this.stream = null;
  this.pingHandler = null;

  console.log('lobby id used the checklobbystatus: ', Meteor.user().profile.lobbyId);
  Meteor.call('checkLobbyStatus', Meteor.user().profile.lobbyId, (err, res) => {
    if (res) {
      console.log('lobby status is ok');
      this.id = Meteor.user().profile.lobbyId;
      this.stream = new Meteor.Streamer(this.id);

      this.stream.on('lobby-players-list', (data) => {
        this.playersList = data;
        this.playersListDep.changed();
      });

      this.stream.on('lobby-start-game', (data) => {
        Meteor.call('joinGame', data, Meteor.userId(), () => {
          Session.set('template', 'game');
        });
      });

      console.log('do i get called too when lobby-start-game is received');

      this.pingHandler = Meteor.setInterval(() => {
        console.log('pinghandle not destroyed yet?!??!');
        Meteor.call('pingLobby', this.id, Meteor.userId())
      }, 1000);
    } else {
      console.log('lobby check failed');
    }
  });

});

Template.lobby.onDestroyed(function () {
  console.log('lobby onDestroyed called');
  if (this.stream) {
    console.log('lobby stream destroyed');
    console.log('lobby id to delete: ', this.id);
    delete Meteor.StreamerCentral.instances[this.id];
    this.stream = null;
  }
  if (this.pingHandler) {
    console.log('lobby pinghandler cleared');
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
    console.log(Template.instance().id);
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
