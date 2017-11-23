import './home.html';

import '../game/game.js';

Template.App_home.onCreated(function() {

});

Template.App_home.helpers({
  getTemplate() {
    return Session.get('template');
  }
});