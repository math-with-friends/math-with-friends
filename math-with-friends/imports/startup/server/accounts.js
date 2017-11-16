import { Accounts } from 'meteor/accounts-base';
import { Players } from '../../api/players/players.js';

Accounts.validateNewUser((user) => {
  Players.insert({ _id: user._id, joinedGame: '' })
  return true;
});
