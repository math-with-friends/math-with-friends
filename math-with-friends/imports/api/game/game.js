import { Meteor } from 'meteor/meteor';

export default class Game {
  constructor(id) {
    this.id = id;
    this.stream = new Meteor.Streamer(this.id);
    this.stream.allowRead('all');
    this.players = {};
    this.state = 0;

    games[this.id] = this;

    Meteor.setInterval(() => this.update(), 5000);
    Meteor.setInterval(() => this.send(), 40);
  }

  update() {
    this.updateGameState();
    this.updateInactivePlayers();
  }

  updateGameState() {
    if (this.state == 1) {
      if (!_.size(this.players) > 0) {
        // Mark this game ready for deletion.
        this.changeState(3);
      }
    }  }

  updateInactivePlayers() {
    if (this.state == 1) {
      _.each(this.players, (player) => {
        if (new Date() - player.ping > 2000) {
          this.removePlayer(player.id);
        }
      });
    }
  }

  send() {
    this.sendSnapshot();
  }

  sendSnapshot() {
    let snapshot = [];
    _.each(this.players, (value, key) => {
      snapshot.push(value);
    });

    this.stream.emit('game-update', snapshot);
  }

  ping(userId) {
    if (this.players[userId]) {
      this.players[userId].ping = new Date();
    }
  }

  changeState(state) {
    this.state = state;
    this.stream.emit('game-state-change', this.state);
  }

  getPlayerPosition(userId) {
    const player = this.players[userId];
    if (!player) {
      return null;
    }

    return {x: player.x, y: player.y};
  }

  getPlayers() {
    return this.players;
  }

  addPlayer(userId, x, y) {
    if (this.state == 0 || this.state == 1) {
      if (!this.players[userId]) {
        this.players[userId] = { id: userId, x: x, y: y, ping: new Date() };

        if (this.state == 0) {
          this.changeState(1);
        }
      }
    }
  }

  modifyPlayer(userId, x, y) {
    const player = this.players[userId];

    player.x = x;
    player.y = y;
  }

  removePlayer(userId) {
    this.players[userId] = null;
    delete this.players[userId];
    this.stream.emit('game-remove', userId);
  }
}