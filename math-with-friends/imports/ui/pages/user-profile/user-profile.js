import "./user-profile.html";
import "./user-profile.css";

Template.profile.helpers({

});

Template.profile.events({
  'click #select-icon-1'(event) {
    event.preventDefault();
    Meteor.call('changeIcon', Meteor.userId(), 1, (err, res) => {
      Session.set('template', 'channel');
    });
  },

  'click #select-icon-2'(event) {
    event.preventDefault();
    Meteor.call('changeIcon', Meteor.userId(), 2, (err, res) => {
      Session.set('template', 'channel');
    });
  },

  'click #select-icon-3'(event) {
    event.preventDefault();
    Meteor.call('changeIcon', Meteor.userId(), 3, (err, res) => {
      Session.set('template', 'channel');
    });
  }
});
