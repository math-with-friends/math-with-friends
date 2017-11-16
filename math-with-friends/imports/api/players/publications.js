import { Meteor } from 'meteor/meteor';
import { Players } from './players.js';

Meteor.publish('players-one', (userId) => {
  return Players.findOne({userId});
});
