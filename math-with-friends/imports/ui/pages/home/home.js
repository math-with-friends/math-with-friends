import './home.html';

import '../game/game.js';

Template.App_home.onCreated(function() {

});

Template.App_home.helpers({
  getTemplate() {
    return Session.get('template');
  },

  getLoginStatus() {
    return Meteor.userId()? 'Logout' : 'Login';
  }
});

Template.App_home.events({
  'click .login'(event, instance) {
    if (Meteor.userId()) {
      Meteor.logout();
    } else {
      Meteor.loginWithCas();
    }
  },

  'click #helper'(event, instance) {
    if (Session.get('helper')) {
      Session.set('helper', false);
    } else {
      Session.set('helper', true);
    }
  }
})