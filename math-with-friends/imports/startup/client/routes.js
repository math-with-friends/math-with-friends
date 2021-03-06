import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import needed templates
import '../../ui/layouts/body/body.js';
import '../../ui/pages/home/home.js';
import '../../ui/pages/not-found/not-found.js';
import '../../ui/pages/game/game.js';
import '../../ui/pages/lobby/lobby.js';
import '../../ui/pages/channel/channel.js';
import '../../ui/pages/landing/landing.js';
import '../../ui/pages/user-profile/user-profile.js';

// Set up all routes in the app
FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('App_body', { main: 'App_home' });
  },
});

FlowRouter.route('/game', {
  action() {
    BlazeLayout.render('App_body', { main: 'game' });
  }
});

FlowRouter.route('/lobby', {
  action() {
    BlazeLayout.render('App_body', { main: 'lobby' });
  }
});

FlowRouter.route('/test', {
  action() {
    BlazeLayout.render('App_body', { main: 'landing' });
  }
})

FlowRouter.route('/user-profile', {
  action() {
    BlazeLayout.render('App_body', { main: 'User_Profile' });
  }
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};
