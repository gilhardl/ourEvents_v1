angular.module('ourEvents.services', [])

.factory('DBA', function($cordovaSQLite, $q, $ionicPlatform) {
  var self = this;

  // Handle query's and potential errors
  self.query = function (query, parameters) {
    parameters = parameters || [];
    var q = $q.defer();

    $ionicPlatform.ready(function () {
      $cordovaSQLite.execute(db, query, parameters)
        .then(function (result) {
          q.resolve(result);
        }, function (error) {
          console.warn('I found an error');
          console.warn(error);
          q.reject(error);
        });
    });
    return q.promise;
  }

  // Proces a result set
  self.getAll = function(result) {
    var output = [];

    for (var i = 0; i < result.rows.length; i++) {
      output.push(result.rows.item(i));
    }
    return output;
  }

  // Proces a single result
  self.getById = function(result) {
    var output = null;
    output = angular.copy(result.rows.item(0));
    return output;
  }

  return self;
})

.factory('Events', function($cordovaSQLite, DBA) {
  // // Some fake testing data
  // var events = [
  // {
  //   id: 1,
  //   title: 'OZORA One Day',
  //   date: new Date('2017-04-15'),
  //   time: new Date(1970, 1, 1, 19, 0, 0, 0),
  //   place: 'Eurosites Les Docks',
  //   adress: 'Paris, France',
  //   description: 'After the yearly traditional gathering and celebrations in Tokyo and Goa, the 6th edition of O.Z.O.R.A. Festival’s One-Day-in event series makes its first stop ever in the French capital too. \n \
  //   The One Day in Paris party is presented together with the Twisted Events team where the Ozorian Valley-born goanauts can meet up with local trancers and psytravellers from around the world to share and spread the joy of being together some more. \n \
  //   Exciting times ahead and mega-blasts guaranteed by the series’ residents and local heroes.',
  //   picture: 'img/event_pictureTest.jpg'
  // }, {
  //   id: 2,
  //   title: 'Acideuh #7',
  //   date: new Date('2017-04-16'),
  //   time: new Date(1970, 1, 1, 19, 0, 0, 0),
  //   place: 'La Machinerie Club',
  //   adress: 'Lyon, France',
  //   description: 'Street Credibility is back. Only acid music all night.',
  //   picture: 'img/event_pictureTest.jpg'
  // }, {
  //   id: 3,
  //   title: 'Astrolab',
  //   date: new Date('2017-04-21'),
  //   time: new Date(1970, 1, 1, 22, 0, 0, 0),
  //   place: 'La Coopérative de Mai',
  //   adress: 'Rue Serge Gainsbourg, 63100 Clermont-Ferrand, France',
  //   description: 'Venez nous rejoindre à la Coopérative de Mai de Clermont-Ferrand pour notre prochaine soirée : Astrolab ! \
  //   Pour cet évènement, 2 scènes avec 2 ambiances articulées autour de la musique Techno/Psytrance. \n \
  //   La Billetterie de la soirée sera tenue par les service de la Coopérative de Mai via leur plateforme habituelle.',
  //   picture: 'img/event_pictureTest.jpg'
  // }, {
  //   id: 4,
  //   title: 'Insane',
  //   date: new Date('2017-05-06'),
  //   time: new Date(1970, 1, 1, 19, 0, 0, 0),
  //   place: 'Parc des Expositions',
  //   adress: 'Rond-Point Michel Benech, 31400 Toulouse, France',
  //   description: 'La troisième édition de l\'Insane se déroulera le 6 mai 2017 au Parc des Expositions de Toulouse.',
  //   picture: 'img/event_pictureTest.jpg'
  // }, {
  //   id: 5,
  //   title: 'Nuits Sonores',
  //   date: new Date('2017-05-23'),
  //   time: new Date(1970, 1, 1, 14, 0, 0, 0),
  //   place: '',
  //   adress: 'Lyon, France',
  //   description: 'Nuits sonores est un laboratoire culturel, artistique et urbain né en 2003 à Lyon. \n \
  //   Espace de brassage d’idées, de projets artistiques et d’initiatives culturelles, Nuits sonores construit depuis 15 ans un panorama exigeant et éditorialisé des cultures contemporaines indépendantes, électroniques et numériques. \n \
  //   À l’écoute de l’époque et de tous les futurs créatifs, Nuits sonores revendique une vision prospective et défricheuse, en quête des artistes de demain et des esthétiques émergentes, toujours à l’affût des nouveaux usages et des pratiques innovantes. \n \
  //   Fort d’une programmation totalement indépendante, exigeante et sans cesse renouvelée, le festival conjugue les valeurs d’ouverture et de diversité, revendique l’universalité de la musique et cultive la transversalité et le décloisonnement artistiques, multipliant ainsi les incursions sur tous les terrains créatifs, du design, de l’image, du graphisme, de la food culture ou de l’architecture.',
  //   picture: 'img/event_pictureTest.jpg'
  // }];

  return {
    all: function() {
      return DBA.query("SELECT * FROM event")
        .then(function(result){
          var events = DBA.getAll(result);
          // Transforme les dates de chaque évènement
          for (i=0; i<events.length; i++) {
            events[i].time = new Date(1970, 1, 1, new Date(events[i].date).getHours(), new Date(events[i].date).getMinutes(), 0, 0);
            events[i].date = new Date(new Date(events[i].date).getFullYear() + '-' + new Date(events[i].date).getMonth() + '-' + new Date(events[i].date).getDate());
          }
          return events;
        });

      // return events;
    },
    add: function(event) {
      var parameters = [event.title, event.date, event.time, event.place, event.adress, event.description, event.pictures];
      return DBA.query("INSERT INTO event (title, date, time, place, adress, description, picture) VALUES (?,?,?,?,?,?,?)", parameters);
      // var newId = events.length+1;
      // event.id = newId;
      // events.push(event)
      // return event.id;
    },
    get: function(eventId) {
      var parameters = [eventId];
      return DBA.query("SELECT * FROM event WHERE id = (?)", parameters)
        .then(function(result) {
          var event = DBA.getById(result);
          event.time = new Date(1970, 1, 1, new Date(event.date).getHours(), new Date(event.date).getMinutes(), 0, 0);
          event.date = new Date(new Date(event.date).getFullYear() + '-' + new Date(event.date).getMonth() + '-' + new Date(event.date).getDate());
          return event;
        });
      // for (var i = 0; i < events.length; i++) {
      //   if (events[i].id === parseInt(eventId)) {
      //     return events[i];
      //   }
      // }
      // return null;
    },
    update: function(event) {
      var parameters = [event.title, event.date, event.time, event.place, event.adress, event.description, event.pictures];
      console.log(event);
      return DBA.query("UPDATE event SET title = (?), date = (?), time = (?), place = (?), adress = (?), description = (?), picture = (?)  WHERE id = (?)", parameters);
      // for (var i = 0; i < events.length; i++) {
      //   if (events[i].id === event.id) {
      //     events[i] = event;
      //     return events[i];
      //   }
      // }
      // return null;
    },
    remove: function(event) {
      var parameters = [event.id];
      console.log(event);
      return DBA.query("DELETE FROM event WHERE id = (?)", parameters);
      // events.splice(events.indexOf(event), 1);
    }
  };
})

.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var friends = [
  {
    id: 1,
    lastname: 'GILHARD',
    firstname: 'Lucas',
    phone: '+33 6 00 00 00 01'
  },{
    id: 2,
    lastname: 'DEVILLE',
    firstname: 'Lorine',
    phone: '+33 6 00 00 00 02'
  },{
    id: 3,
    lastname: 'GERBAUD',
    firstname: 'Rémy',
    phone: '+33 6 00 00 00 03'
  },{
    id: 4,
    lastname: 'MINOTTI',
    firstname: 'Ugo',
    phone: '+33 6 00 00 00 04'
  },{
    id: 5,
    lastname: 'GONZALES',
    firstname: 'Jules',
    phone: '+33 6 00 00 00 05'
  }];

  return {
    all: function() {
      return friends;
    },
    add: function(lastname, firstname, phone) {
      var newId = friends.length+1;
      friends.push({id: newId, lastname: lastname.toUpperCase(), firstname: firstname, phone: phone});
      return newId;
    },
    get: function(friendId) {
      for (var i = 0; i < friends.length; i++) {
        if (friends[i].id === parseInt(friendId)) {
          return friends[i];
        }
      }
      return null;
    },
    update: function(friend) {
      for (var i = 0; i < friends.length; i++) {
        if (friends[i].id === friend.id) {
          friends[i] = friend;
          return friends[i];
        }
      }
      return null;
    },
    remove: function(friend) {
      friends.splice(friends.indexOf(friend), 1);
    }
  };
})

.factory('EventFriends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var eventFriends = [
  {
    id: 1,
    idEvent: 1,
    idFriend: 2
  },{
    id: 2,
    idEvent: 1,
    idFriend: 4
  },{
    id: 3,
    idEvent: 1,
    idFriend: 5
  },{
    id: 4,
    idEvent: 2,
    idFriend: 1
  },{
    id: 5,
    idEvent: 2,
    idFriend: 2
  },{
    id: 6,
    idEvent: 3,
    idFriend: 4
  },{
    id: 7,
    idEvent: 4,
    idFriend: 1
  },{
    id: 8,
    idEvent: 4,
    idFriend: 2
  },{
    id: 9,
    idEvent: 5,
    idFriend: 3
  },{
    id: 10,
    idEvent: 5,
    idFriend: 4
  }];

  return {
    add: function(eventId, friendId) {
      var newId = eventFriends+1;
      eventFriends.push({id: newId, idEvent: eventId, idFriend: friendId});
      return newId;
    },
    getFriendsByEvent: function(eventId) {
      var friends = [];
      for (var i = 0; i < eventFriends.length; i++) {
        if (eventFriends[i].idEvent === parseInt(eventId)) {
          friends.push(eventFriends[i].idFriend);
        }
      }
      return friends;
    },
    removeFriend: function(idEvent, idFriend) {
      for (var i = 0; i < eventFriends.length; i++) {
        if (eventFriends[i].idEvent === parseInt(idEvent) && eventFriends[i].idFriend === parseInt(idFriend)) {
          eventFriends.splice(i, 1);
        }
      }
    },
    remove: function(eventFriend) {
      eventFriends.splice(eventFriends.indexOf(eventFriend), 1);
    }
  };
});
