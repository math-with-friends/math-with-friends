import { Meteor } from 'meteor/meteor';

export default class Game {
  constructor(id) {
    this.id = id;
    this.players = {};

    games[this.id] = this;

    Meteor.setInterval(() => this.update(), 5000);
    Meteor.setInterval(() => this.send(), 1000/44);
  }

  update() {
    this.updateGameState();
  }

  updateGameState() {
    console.log(_.size(this.players));
  }

  send() {
    this.sendSnapshot();
  }

  sendSnapshot() {
    let snapshot = [];
    _.each(this.players, (value, key) => {
      snapshot.push(value);
    });

    io.sockets.in(this.id).emit('game-update', snapshot);
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
    if (!this.players[userId]) {
      this.players[userId] = { id: userId, x: x, y: y };
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
    io.sockets.in(this.id).emit('game-remove', userId);
  }
}