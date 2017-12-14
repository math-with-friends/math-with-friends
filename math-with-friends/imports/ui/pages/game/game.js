import './game.html';
import './game.css';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

class MainScene {
  constructor(game) {
    this.game = game;
    this.gameId = Meteor.user().profile.gameId;
    this.userId = Meteor.userId();
    this.iconId = Meteor.user().profile.iconId;
    this.userName = Meteor.user().profile.userName;
    this.entities = {};

    this.lines = [];
    this.blocks = [];
    this.questions = [];
    this.trues = [];
    this.falses = [];

    this.lastUpdate = new Date();
    // Assume 80 to be the default packet latency.
    this.latency = 80;

    // this.stream = new Meteor.Streamer(this.gameId);

  }

  init(stream) {
    console.log('game init');
    this.stream = stream;
  }

  // Required.
  preload() {
    this.game.load.image('player', `img/icon-${this.iconId}.png`);
    this.game.load.image('background', 'img/background.png');
  }

  // Required.
  create() {
    this.createWorld();
    this.createPlayer();
    this.createListeners();
  }

  createWorld() {
    this.game.add.tileSprite(0, 0, 2000, 500, 'background');
    this.game.world.setBounds(0, 0, 2000, 500);

    // Allows smooth rendering.
    this.game.renderer.renderSession.roundPixels = true;

    // Disables game pausing when browser window is not in focus.
    // Mainly for testing purposes...
    this.game.stage.disableVisibilityChange = true;

    this.lines[0] = new Phaser.Line(500, 250, 500, 500);
    this.lines[1] = new Phaser.Line(1000, 0, 1000, 250);
    this.lines[2] = new Phaser.Line(1500, 250, 1500, 500);

    this.blocks[0] = new Phaser.Line(475, 250, 525, 250);
    this.blocks[1] = new Phaser.Line(975, 250, 1025, 250);
    this.blocks[2] = new Phaser.Line(1475, 250, 1525, 250);

    this.questions[0] = this.game.add.text(150, 50, '1 + 1 = 2', { font: "30px", fill: "#000000" });
    this.questions[1] = this.game.add.text(650, 50, '11 + 11 = 12', { font: "30px", fill: "#000000" });
    this.questions[2] = this.game.add.text(1150, 50, '111 + 111 = 222', { font: "30px", fill: "#000000" });

    this.trues[0] = this.game.add.text(475, 125, 'True', { font: "30px", fill: "#000000" });
    this.trues[1] = this.game.add.text(975, 125, 'True', { font: "30px", fill: "#000000" });
    this.trues[2] = this.game.add.text(1475, 125, 'True', { font: "30px", fill: "#000000" });

    this.falses[0] = this.game.add.text(475, 375, 'False', { font: "30px", fill: "#000000" });
    this.falses[1] = this.game.add.text(975, 375, 'False', { font: "30px", fill: "#000000" });
    this.falses[2] = this.game.add.text(1475, 375, 'False', { font: "30px", fill: "#000000" });
  }

  createPlayer() {
    this.entities[this.userId] = this.add.sprite(0, 170, 'player');

    this.playerLabel = this.game.add.text(0, 95, this.userName, { font: "20px", fill: "#000000" });
    this.playerLines = [];
    this.playerLines[0] = new Phaser.Line;
    this.playerLines[1] = new Phaser.Line;

    this.player = this.entities[this.userId];
    this.player.id = this.userId;
    this.player.positionBuffer = [];
    this.player.addChild(this.playerLabel);

    this.cursor = this.game.input.keyboard.createCursorKeys();
    this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.spaceKey.onDown.add(function() { this.body.velocity.y = -400; }, this.player);

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.enable(this.player);
    this.game.physics.arcade.applyGravity = false;
    this.game.camera.follow(this.player);

    this.player.body.gravity.y = 750;
    this.player.body.velocity.x = 100;

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
      this.calculateLatency();
      this.handleServerMessage(data);
    });

    this.stream.on('game-remove', (data) => {
      this.handleDisconnectedPlayer(data);
    });

    $(window).bind('beforeunload', function () {
      Meteor.call('removePlayer', this.gameId, this.userId);
    });
  }

  calculateLatency() {
    const current = new Date();
    this.latency = current - this.lastUpdate;
    this.lastUpdate = current;
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
    this.updateCollision();
    this.updateDebug();
  }

  updatePlayerControl() {
    // if (this.cursor.left.isDown) {
    //   this.player.body.velocity.x = -100;
    // } else if (this.cursor.right.isDown) {
    //   this.player.body.velocity.x = 100;
    // }

    // if (this.cursor.up.isDown) {
    //   this.player.body.velocity.y = -100;
    // } else if (this.cursor.down.isDown) {
    //   this.player.body.velocity.y = 100;
    // }

    this.playerLines[0].setTo(this.player.position.x, this.player.position.y, this.player.position.x + this.player.width, this.player.position.y);
    this.playerLines[1].setTo(this.player.position.x, this.player.position.y + this.player.height, this.player.position.x + this.player.width, this.player.position.y + this.player.height);

    Meteor.call('sendPlayerPosition', this.gameId, this.userId, this.player.body.position.x, this.player.body.position.y);
  }

  updateInterpolation() {
    // console.log(this.latency);
    const renderTimestamp = new Date() - 80 - this.latency;
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

  updateCollision() {
    _.each(this.lines, (line) => {
      if (this.playerLines[0].intersects(line)) {
        window.alert('Wrong answer! Game over.');
        Session.set('template', 'channel');
      }
    });

    _.each(this.lines, (line) => {
      if (this.playerLines[1].intersects(line)) {
        window.alert('Wrong answer! Game over.');
        Session.set('template', 'channel');
      }
    });

    if (this.player.body.position.y > 500) {
      window.alert('You fell! Game over.');
      Session.set('template', 'channel');
    }

    if (this.player.body.position.y < -100) {
      window.alert('Out of boundaries! Game over.');
      Session.set('template', 'channel');
    }

    if (this.player.body.position.x > 2000) {
      window.alert('Congrats! You won.');
      Session.set('template', 'channel');
    }
  }

  updateDebug() {
    this.game.debug.geom(this.playerLines[0]);
    this.game.debug.geom(this.playerLines[1]);
    // _.each(this.lines, (line) => {
    //   this.game.debug.geom(line);
    // });
    _.each(this.blocks, (block) => {
      this.game.debug.geom(block);
    });
  }
}

Template.game.onCreated(function () {
  // Things to check before user sees game:
  // - User is logged in
  // - User's joined game exists
  this.game = new Phaser.Game(500, 500, Phaser.AUTO, 'game-canvas', undefined, true, false);
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

Template.game.helpers({
  isHelperVisible() {
    if (Session.get('helper')) {
      return 'visible';
    } else {
      return 'not-visible';
    }
  }
});

Template.game.onDestroyed(function () {
  this.game.destroy();

  if (this.stream) {
    delete Meteor.StreamerCentral.instances[this.id];
    this.stream = null;
  }

  if (this.pingHandler) {
    Meteor.clearInterval(this.pingHandler);
  }
});