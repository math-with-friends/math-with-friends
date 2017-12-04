import './game.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

class MainScene {
  constructor(game) {
    this.game = game;
    this.gameId = Meteor.user().profile.gameId;
    console.log('GAMEID: ', this.gameId);
    this.userId = Meteor.userId();
    this.entities = {};

    // this.stream = new Meteor.Streamer(this.gameId);

  }

  init(stream) {
    console.log('game init');
    this.stream = stream;
  }

  // Required.
  preload() {
    this.game.load.image('player', 'img/bird.png');
    this.game.load.image('background', 'img/debug-grid.png');
  }

  // Required.
  create() {
    this.createWorld();
    this.createPlayer();
    this.createListeners();
  }

  createWorld() {
    this.game.add.tileSprite(0, 0, 1920, 1920, 'background');
    this.game.world.setBounds(0, 0, 1920, 1920);

    // Allows smooth rendering.
    this.game.renderer.renderSession.roundPixels = true;

    // Disables game pausing when browser window is not in focus.
    // Mainly for testing purposes...
    this.game.stage.disableVisibilityChange = true;
  }

  createPlayer() {
    this.cursor = this.game.input.keyboard.createCursorKeys();
    this.entities[this.userId] = this.add.sprite(0, 0, 'player');
    this.player = this.entities[this.userId];
    this.player.id = this.userId;
    this.player.positionBuffer = [];
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.enable(this.player);
    this.game.physics.arcade.applyGravity = false;
    this.game.camera.follow(this.player);

    // In case player disconnects, refreshes, etc., restore player's position according to
    // what's on the server.
    Meteor.call('getPlayerPosition', this.gameId, this.userId, (err, res) => {
      if (res) {
        this.player.position.x = res.x;
        this.player.position.y = res.y;
      }
    })
  }

  createListeners() {
    this.stream.on('game-update', (data) => {
      this.handleServerMessage(data);
    });

    this.stream.on('game-remove', (data) => {
      this.handleDisconnectedPlayer(data);
    });

    $(window).bind('beforeunload', function () {
      Meteor.call('removePlayer', this.gameId, this.userId);
    });
  }

  handleServerMessage(data) {
    _.each(data, (element) => {
      // If the data received is for our player, ignore this portion of message.
      if (element.id === this.userId) {
        return;
      }

      let entity = this.entities[element.id];
      if (!entity) {
        console.log('new entity being created', element.id);
        this.entities[element.id] = this.game.add.sprite(element.x, element.y, 'player');
        this.entities[element.id].positionBuffer = [];
        this.entities[element.id].id = element.id;
      } else {
        entity.positionBuffer.push({ timestamp: new Date(), x: element.x, y: element.y });
        // console.log('direct position change');
        // entity.position.x = element.x;
        // entity.position.y = element.y;
      }
    });
  }

  handleDisconnectedPlayer(userId) {
    if (this.entities[userId]) {
      this.entities[userId].kill();
      this.entities[userId].destroy();
      this.entities[userId] = null;
      delete this.entities[userId];
    }
  }

  // Required.
  update() {
    this.updatePlayerControl();
    this.updateInterpolation();
  }

  updatePlayerControl() {
    this.player.body.velocity.set(0, 0);

    if (this.cursor.left.isDown) {
      this.player.body.velocity.x = -100;
    } else
      if (this.cursor.right.isDown) {
        this.player.body.velocity.x = 100;
      }
    if (this.cursor.up.isDown) {
      this.player.body.velocity.y = -100;
    } else
      if (this.cursor.down.isDown) {
        this.player.body.velocity.y = 100;
      }

    Meteor.call('sendPlayerPosition', this.gameId, this.userId, this.player.body.position.x, this.player.body.position.y);
  }

  updateInterpolation() {
    const renderTimestamp = (new Date()) - (80);
    _.each(this.entities, (entity) => {
      // Do not interpolate our player.
      if (entity.id === this.userId) {
        return;
      }

      const buffer = entity.positionBuffer;
      while (buffer.length >= 2 && buffer[1].timestamp <= renderTimestamp) {
        buffer.shift();
      }

      if (buffer.length >= 2 && buffer[0].timestamp <= renderTimestamp && renderTimestamp <= buffer[1].timestamp) {
        const x0 = buffer[0].x;
        const x1 = buffer[1].x;
        const y0 = buffer[0].y;
        const y1 = buffer[1].y;
        const t0 = buffer[0].timestamp;
        const t1 = buffer[1].timestamp;

        entity.position.x = x0 + (x1 - x0) * (renderTimestamp - t0) / (t1 - t0);
        entity.position.y = y0 + (y1 - y0) * (renderTimestamp - t0) / (t1 - t0);
      }
    });
  }
}

Template.game.onCreated(function () {
  // Things to check before user sees game:
  // - User is logged in
  // - User's joined game exists
  this.game = new Phaser.Game(500, 200, Phaser.CANVAS, 'canvas', undefined, true);
  this.id = null;
  this.pingHandler = null;
  this.stream = null;

  // Check the validity of the game that s/he is in..
  Meteor.call('checkGameStatus', Meteor.user().profile.gameId, (err, res) => {
    // If all is good, start the game!
    if (res) {
      this.id = Meteor.user().profile.gameId;

      this.pingHandler = Meteor.setInterval(() => {
        Meteor.call('pingGame', this.id, Meteor.userId())
      }, 1000);

      this.stream = new Meteor.Streamer(this.id);

      this.game.state.add('main', MainScene);
      this.game.state.start('main', true, false, this.stream);
    } else {
      console.log('game check failed');
    }
  });
});

Template.game.onDestroyed(function () {
  if (this.stream) {
    delete Meteor.StreamerCentral.instances[this.id];
    this.stream = null;
  }
  if (this.pingHandler) {
    Meteor.clearInterval(this.pingHandler);
  }
});