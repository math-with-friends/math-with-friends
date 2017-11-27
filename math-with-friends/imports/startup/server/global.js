
// io = null;
games = {};
lobbies = {};

Meteor.startup(() => {

  // For now, channel behaviors will be defined below.
  const stream = new Meteor.Streamer('test');
  stream.allowRead('all');

  Meteor.setInterval(() => {
    const lobbiesToSend = _.map(lobbies, (lobby) => {
      return {
        id: lobby.id,
        state: lobby.state,
        playerCount: _.size(lobby.players)
      }
    })
    stream.emit('test', lobbiesToSend);

    _.each(lobbies, (lobby) => {
      if (lobby.state === 2 || lobby.state === 3) {
        lobby.cleanUp();
        delete lobbies[lobby.id];
      }
    });
  }, 3000);

  Meteor.methods({
    chatChannel(userId, message) {
      stream.emit('channel-chat', userId, message);
    }
  });
});