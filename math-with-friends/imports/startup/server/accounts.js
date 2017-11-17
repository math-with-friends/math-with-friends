import { Accounts } from 'meteor/accounts-base';
import { Players } from '../../api/players/players.js';

Accounts.onCreateUser(function(options, user) {
  // For some reason we need to store the additional information in the profile field.
  user.profile = {};
  user.profile.gameId = '';
  user.profile.socketId = '';
  return user;
});
