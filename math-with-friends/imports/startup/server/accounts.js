import { Accounts } from 'meteor/accounts-base';

Accounts.onCreateUser(function(options, user) {
  // For some reason we need to store the additional information in the profile field.
  user.profile = {};
  user.profile.gameId = '';
  user.profile.lobbyId = '';
  user.profile.userName = user.services.cas.id;
  return user;
});
