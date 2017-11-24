import Game from '../game/game.js';

/*
Manager for Lobby.
Whoever's in a lobby can perform 2 actions:
- Chat
- Press the 'Ready' button

There is always one player designated as the 'leader' who can press the 'Go' button
instead of the 'Ready' button. The client code will restrict the leader from pressing the
'Go' button when not everyone in the room has pressed the 'Ready' button. The server code
will also verify this.
 */
export default class Lobby {
  constructor(id) {
    this.id = id;
    this.players = {};

    // 0 = Pre-initialization. Nobody has ever joined yet- do not attempt to destroy lobby.
    // 1 = In-lobby. We can start testing to see if we can destroy lobby.
    // 2 = Game-in-progress.
    // 3 = Finished. Marked ready for deletion.
    this.state = 0;
    this.readyCount = 0;

    console.log(this.id);
    this.stream = new Meteor.Streamer(this.id);
    this.stream.allowRead('all');

    lobbies[this.id] = this;

    this.updateHandle = Meteor.setInterval(() => this.update(), 1000);
    this.sendHandle = Meteor.setInterval(() => this.send(), 1000);
  }

  cleanUp() {
    Meteor.clearInterval(this.updateHandle);
    Meteor.clearInterval(this.sendHandle);
    this.stream = null;
  }

  update() {
    this.updateLobbyState();
    this.updateInactivePlayers();
  }

  updateLobbyState() {
    if (this.state == 1) {
      if (!_.size(this.players) > 0) {
        // Mark this lobby ready for deletion.
        this.changeState(3);
      }
    }
  }

  updateInactivePlayers() {
    if (this.state == 1) {
      _.each(this.players, (player) => {
        if (new Date() - player.ping > 2000) {
          console.log('inactiveplayer removed');
          this.removePlayer(player.id);
        }
      });
    }
  }

  send() {
    this.sendPlayersList();
  }

  sendPlayersList() {
    if (this.state == 1) {
      console.log('sendingPlayersList');
      this.stream.emit('lobby-players-list', this.players);
    }
  }

  ping(userId) {
    if (this.players[userId]) {
      this.players[userId].ping = new Date();
    }
  }

  addPlayer(userId) {
    // Cannot join game after game started.
    if (this.state == 0 || this.state == 1) {

      // Don't re-add existing players.
      if (!this.players[userId]) {
        this.players[userId] = { id: userId, ready: false, ping: new Date()};

        // If this is the first player to ever join the lobby, enable destroying of lobby.
        if (this.state == 0) {
          console.log('player added, change state');
          this.changeState(1);
        }
      }
    }
  }

  removePlayer(userId) {
    if (this.players[userId]) {
      delete this.players[userId];
    }
  }

  changeState(state) {
    this.state = state;
    this.stream.emit('lobby-state-change', this.state);
    console.log('change state', state);
  }

  increaseReadyCount() {
    this.readyCount++;

    // ASSUME WE'RE NOT USING READY -> GO MECHANISM. For testing purposes let's start the game
    // when everyone in the lobby is ready.
    this.startGame(this.id);
  }

  startGame(lobbyId) {
    // -1 because leader cannot press ready.
    if (_.size(this.players) != (this.readyCount )) {
      console.log('Could not start game because not all players are ready!');
    } else {
      const game = new Game(lobbyId);
      // _.each(this.players, (player) => {
      //   console.log('player profile.gameId set in lobby api');
      //   Meteor.users.update({_id: player.id}, {$set: {'profile.gameId': lobbyId}});
      //   game.addPlayer(player.id, 0, 0);
      // });

      this.stream.emit('lobby-start-game', lobbyId);
      this.changeState(2);
    }
  }
}