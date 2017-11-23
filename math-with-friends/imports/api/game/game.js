import { Meteor } from 'meteor/meteor';

export default class Game {
  constructor(id) {
    this.id = id;
    this.stream = new Meteor.Streamer(this.id);
    this.stream.allowRead('all');
    this.players = {};

    games[this.id] = this;

    Meteor.setInterval(() => this.update(), 5000);
    Meteor.setInterval(() => this.send(), 1000/44);
  }

  update() {
    this.updateGameState();
  }

  updateGameState() {
    // console.log(_.size(this.players));
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
      this.players[userId] = { id: userId, x: x, y: y, ping: new Date() };
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