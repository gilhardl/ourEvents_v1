var db = null;

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('ourEvents', ['ionic', 'ngCordova', 'ion-floating-menu', 'ourEvents.controllers', 'ourEvents.services'])

.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    if(window.cordova) {
      // App syntax
      if(ionic.Platform.isAndroid()){
        // Works on android but not in iOS
        db = $cordovaSQLite.openDB({ name: "ourEvents.db", iosDatabaseLocation:'default'});
      } else{
        // Works on iOS
        db = window.sqlitePlugin.openDatabase({ name: "ourEvents.db", location: 2, createFromLocation: 1});
       }
      // db = $cordovaSQLite.openDB("ourEvents.db");
    } else {
      // Ionic serve syntax
      db = window.openDatabase("ourEvents.db", "1.0", "ouEvents", -1);
    }

    // Création des tables de la BD
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS event (id integer primary key autoincrement, title text not null, date char(20) not null, time char(20), place text, adress text, description text, picture text)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS friend (id integer primary key autoincrement, lastname text not null, firstname text, phone char(20))");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS event_friend (id integer primary key autoincrement, idEvent int not null, idFriend int not null)");
  });
})

.config(['$ionicConfigProvider', function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom'); // other values: top
}])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    .state('events', {
      url: '/events',
      views: {
        '': {
          templateUrl: 'templates/events.html',
          controller: 'EventsCtrl'
        }
      }
    })

    .state('event-detail', {
      url: '/event-detail/:eventId',
      views: {
        '': {
          templateUrl: 'templates/event-detail.html',
          controller: 'EventDetailCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/events');

});
