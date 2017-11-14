import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import needed templates
import '../../ui/layouts/body/body.js';
import '../../ui/pages/home/home.js';
import '../../ui/pages/not-found/not-found.js';
import '../../ui/pages/game/game.js';

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
})

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};
