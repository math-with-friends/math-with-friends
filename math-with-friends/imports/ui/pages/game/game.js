import './game.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

class MainScene {
  constructor(game) {
    this.game = game;
  }

  preload() {

  }

  create() {

  }

  update() {

  }
}

Template.game.onCreated(function() {
  // Things to check before user sees game:
  // - User is logged in
  // - User's joined game exists
  this.game = new Phaser.Game(500, 200, Phaser.CANVAS, 'canvas');
  this.game.state.add('main', MainScene);
  this.game.state.start('main');
});