angular.module('ourEvents.controllers', [])

.controller('EventsCtrl', function($scope, $ionicModal, $cordovaCamera, $cordovaToast, Events) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  // $scope.$on('$ionicView.enter', function(e) {
  //
  // });
  $scope.updateUI = function() {
    // Récupération de la liste de tous les evenements
    Events.all()
      .then(function(events){
        // Affectation au $scope
        $scope.events = events;
      });
  }

  $scope.updateUI();

  // Fonction de suppression d'un evenement
  $scope.remove = function(event) {
    Events.remove(event);
    $scope.updateUI();
  };

  // Définition de la modale pour la création d'un évènement
  $ionicModal.fromTemplateUrl('templates/event-new.html', {scope: $scope, animation: 'slide-in-up'})
    .then(function(modal) {
      $scope.modalNewEvent = modal;
    });

  $scope.openModalNewEvent = function() {
    var today = new Date();
    $scope.event = {id: undefined, title: undefined, date: new Date(today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate()), time: undefined, place: undefined, adress: undefined, description: undefined};

    // Converti l'image par défaut d'un évènement en base64 pour l'affecter à l'event
    var urlPicture = 'img/no-picture.jpg';
    var img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.width =this.width;
      canvas.height =this.height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(this, 0, 0);

      // Affecte l'image convertie en base64 à l'event
      $scope.event.picture = canvas.toDataURL("image/jpg");
    };
    img.src = urlPicture;


    $scope.modalNewEvent.show();  // Obligé d'afficher la popup avant l'initialisation de la map sinon document.getElementById("google-map-new") plante.


    // Affichage de la map
    var mapOptions = {
      center: new google.maps.LatLng(0, 0),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    // Crée un objet map et l'ajoute dans la div d'id "google-map" avec les options définis ci-dessus
    $scope.map = new google.maps.Map(document.getElementById("google-map-new"), mapOptions);
    // Récupère le champs adresse et y implément l'autocomplete Google
    var input = document.getElementById('adress-new');
    var autocomplete = new google.maps.places.Autocomplete(input);
    // On limite l'autocomplete à ce qui est accessible sur la map (si on avait réduit la map par exemple)
    autocomplete.bindTo('bounds', $scope.map);
    // Listener sur la sélection d'une adresse dans la popup de sélection
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
      var place = autocomplete.getPlace();
      if (!place.geometry) { return; }

      // Met directement à jour (et à la main) l'adress de l'evenement
      $scope.event.adress = place.formatted_address

      // Centre la map sur l'adresse sélectionnée
      if (place.geometry.viewport) {
        $scope.map.fitBounds(place.geometry.viewport);
      } else {
        $scope.map.setCenter(place.geometry.location);
        $scope.map.setZoom(15);
      }

      // Centre la map et place un marqueur sur la map à l'adresse selectionnée
      $scope.map.setCenter(place.geometry.location);
      $scope.map.marker.setMap(null);
      $scope.map.marker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: place.geometry.location
      });
    });

    $scope.locateUser = function() {
      // Définition des options pour le plugin de géolocalisation
      var options = {timeout: 10000, enableHighAccuracy: true};

      $cordovaGeolocation.getCurrentPosition(options)
        .then(function(position){
            // Récupération de la latitude et de la longitude du smartphone
            var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            var geocoder = new google.maps.Geocoder();
            geocodeLatLng(geocoder, latLng);
        }, function(error){
          console.log("Impossible de récupérer la position courante");
        });
    }

  };
  $scope.closeModalNewEvent = function() { $scope.modalNewEvent.hide(); };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() { $scope.modalNewEvent.remove(); });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() { });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() { });

  // Fonction de récupération d'une photo (Camera OU Gallery)
  $scope.getPicture = function(selection) {
    var options = {
      quality : 100,
      destinationType : Camera.DestinationType.DATA_URL,
      allowEdit : true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 500,
      targetHeight: 500,
      saveToPhotoAlbum: false
    };
    switch (selection) {
      case "camera":
        options.sourceType = Camera.PictureSourceType.CAMERA;
        break;
      case "library":
        options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
        break;
    }
    $cordovaCamera.getPicture(options)
      .then(function(imageData) {
        $scope.event.picture = "data:image/jpeg;base64," + imageData;
        Events.update($scope.event);

      }, function(err) {
          // An error occured. Show a message to the user
      });

  };

  $scope.addEvent = function() {
    if ($scope.event.title == undefined || $scope.event.title == "") {
      $cordovaToast.showShortBottom('Veuillez renseigner un titre pour l\'évènement à créer')
      return;
    } else if ($scope.event.date == undefined || $scope.event.date == "") {
      $cordovaToast.showShortBottom('Veuillez renseigner une date pour l\'évènement à créer')
      return;
    }
    Events.add($scope.event);
    $scope.updateUI();
    $scope.closeModalNewEvent();
  };
})



.controller('EventDetailCtrl', function($scope, $cordovaContacts, $stateParams, $ionicModal, $cordovaGeolocation, $cordovaCamera, Events, Friends, EventFriends) {

  //////////////////////////////
  //         INFOS
  //////////////////////////////

  $scope.updateUI = function() {
    // Récupération de l'évènements depuis le service
    Events.get($stateParams.eventId)
      .then(function(event){
        // Affectation au $scope
        $scope.event = event;
      });
  }

  $scope.updateUI();

  // Définition de la modale permettant l'édition de l'évènement
  $ionicModal.fromTemplateUrl('templates/event-edit.html', {scope: $scope, animation: 'slide-in-up'})
    .then(function(modal) {
      $scope.modal = modal;
    });
  $scope.openModal = function() { $scope.modal.show(); };
  $scope.closeModal = function() {
    var res = Events.update($scope.event);
    console.log(res);
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() { $scope.modal.remove(); });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() { });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() { });

  $scope.getPicture = function(selection) {
    var options = {
      quality : 100,
      destinationType : Camera.DestinationType.DATA_URL,
      allowEdit : true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 500,
      targetHeight: 500,
      saveToPhotoAlbum: false
    };
    switch (selection) {
      case "camera":
        options.sourceType = Camera.PictureSourceType.CAMERA;
        break;
      case "library":
        options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
        break;
    }
    $cordovaCamera.getPicture(options)
      .then(function(imageData) {
        $scope.event.picture = "data:image/jpeg;base64," + imageData;

      }, function(err) {
          // An error occured. Show a message to the user
      });
  };


  //////////////////////////////
  //         LIEU
  //////////////////////////////

  $scope.loadMap = function() {
    // Affichage de la map
    var mapOptions = {
      center: new google.maps.LatLng(0, 0),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // Crée un objet map et l'ajoute dans la div d'id "google-map" avec les options définis ci-dessus
    $scope.map = new google.maps.Map(document.getElementById("google-map"), mapOptions);

    // Crée un géocode permettant de récupérer une position (latitude, longitude) depuis une adresse
    var geocoder = new google.maps.Geocoder();
    if($scope.event.adress != undefined) {
      geocodeAddress(geocoder, $scope.event.adress);
    }

    // Récupère le champs adresse et y implément l'autocomplete Google
    var input = document.getElementById('adress-edit');
    var autocomplete = new google.maps.places.Autocomplete(input);
    // On limite l'autocomplete à ce qui est accessible sur la map (si on avait réduit la map par exemple)
    autocomplete.bindTo('bounds', $scope.map);

    // Crée une infoWindow (une petite popup qui peut s'afficher dans la map)
    var infowindow = new google.maps.InfoWindow();

    // Listener sur la sélection d'une adresse dans la popup de sélection
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
      // Ferme l'éventuelle infoWindows ouverte et récupère l'adresse
      infowindow.close();
      var place = autocomplete.getPlace();
      if (!place.geometry) { return; }

      // Met directement à jour (et à la main) l'adress de l'evenement
      $scope.event.adress = place.formatted_address
      Events.update($scope.event);

      // Centre la map sur l'adresse sélectionnée
      if (place.geometry.viewport) {
        $scope.map.fitBounds(place.geometry.viewport);
      } else {
        $scope.map.setCenter(place.geometry.location);
        $scope.map.setZoom(15);
      }

      // Centre la map et place un marqueur sur la map à l'adresse selectionnée
      $scope.map.setCenter(place.geometry.location);
      $scope.map.marker.setMap(null);
      $scope.map.marker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: place.geometry.location
      });
    });
  }

  $scope.locateUser = function() {
    // Définition des options pour le plugin de géolocalisation
    var options = {timeout: 10000, enableHighAccuracy: true};

    $cordovaGeolocation.getCurrentPosition(options)
      .then(function(position){
          // Récupération de la latitude et de la longitude du smartphone
          var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

          var geocoder = new google.maps.Geocoder();
          geocodeLatLng(geocoder, latLng);
      }, function(error){
        console.log("Impossible de récupérer la position courante");
      });
  }



  //////////////////////////////
  //         MES AMIS
  //////////////////////////////

  $scope.loadFriends = function() {
    // Récupération de tous les amis liés à cet évènement
    var linkedFriendsId = EventFriends.getFriendsByEvent($scope.event.id);
    $scope.linkedFriends = [];
    for (var i = 0; i < linkedFriendsId.length; i++) {
      $scope.linkedFriends.push(Friends.get(linkedFriendsId[i]));
    }

    $scope.checkFriends = { };
    $scope.checkContacts = { };
  }

  // Définition de la modale pour l'ajout d'amis existants dans l'application
  $ionicModal.fromTemplateUrl('templates/friends-select.html', {scope: $scope, animation: 'slide-in-up'})
    .then(function(modal) {
      $scope.modalAddFriends = modal;
    });
  $scope.openModalAddFriends = function() {
    ////// Récupère les amis qu'il est possible d'ajouter à l'évènement
    // Récupère d'abord tous les amis
    var allFriends = Friends.all();
    $scope.friendsToAdd = allFriends.filter(friendOutOfEvent);
    $scope.modalAddFriends.show();
  };
  $scope.closeModalAddFriends = function() { $scope.modalAddFriends.hide(); };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() { $scope.modalAddFriends.remove(); });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() { });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() { });

  $scope.addFriends = function() {
    var array = [];
    for(friendId in $scope.checkFriends) {
        if($scope.checkFriends[friendId] == true) {
          EventFriends.add($scope.event.id, friendId);
          $scope.linkedFriends.push(Friends.get(friendId))
        }
    }
    $scope.closeModalAddFriends()
  }

  // Définition de la modale pour l'ajout d'amis depuis les contacts du téléphone
  $ionicModal.fromTemplateUrl('templates/contacts-select.html', {scope: $scope, animation: 'slide-in-up'})
    .then(function(modal) {
      $scope.modalAddContactFriends = modal;
    });
  $scope.openModalAddContactFriends = function(phoneContacts = false) {
    // Récupère tous les conacts du téléphone
    $cordovaContacts.find({fields: ['']}).then(function(allContacts) {
      $scope.contactsToAdd = allContacts;
    });
    $scope.modalAddContactFriends.show();
  };
  $scope.closeModalAddContactFriends = function() { $scope.modalAddContactFriends.hide(); };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() { $scope.modalAddContactFriends.remove(); });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() { });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() { });

  $scope.addContactFriends = function() {
    var array = [];
    for(contactId in $scope.checkContacts) {
        if($scope.checkContacts[contactId] == true) {
          for(var i = 0; i < $scope.contactsToAdd.length; i++) {
            if(contactId == $scope.contactsToAdd[i].id) {
              var phone;
              if($scope.contactsToAdd[i].phoneNumbers[0] != undefined) {
                phone = $scope.contactsToAdd[i].phoneNumbers[0].value
              }
              var friendId = Friends.add($scope.contactsToAdd[i].name.familyName, $scope.contactsToAdd[i].name.givenName, phone);
              $scope.linkedFriends.push(Friends.get(friendId))
            }
          }
        }
    }
    $scope.closeModalAddContactFriends()
  }


  // Fonction de suppression d'un ami
  $scope.removeFriend = function(friend) {
    $scope.linkedFriends.splice($scope.linkedFriends.indexOf(friend), 1);
    EventFriends.removeFriend($scope.event.id, friend.id);
  };

  friendOutOfEvent = function(friend) {
    if($scope.linkedFriends.indexOf(friend) == -1) {
      return true;
    } else {
      return false;
    }
  }


  function geocodeAddress(geocoder, adress) {
    geocoder.geocode({'address': adress}, function(results, status) {
      if (status === 'OK') {
        $scope.map.setCenter(results[0].geometry.location);
        $scope.map.marker = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          position: results[0].geometry.location
        });
      } else {
        // Adresse inconnue
      }
    });
  }

  function geocodeLatLng(geocoder, latLng) {
    geocoder.geocode({'location': latLng}, function(results, status) {
      if (status === 'OK') {
        if (results[1]) {
          var place = results[1];
          $scope.map.setCenter(place.geometry.location);
          $scope.map.marker.setMap(null);
          $scope.map.marker = new google.maps.Marker({
            map: $scope.map,
            animation: google.maps.Animation.DROP,
            position: place.geometry.location
          });

          if (!place.geometry) { return; }

          // Met directement à jour (et à la main) l'adress de l'evenement
          $scope.event.adress = place.formatted_address;
          Events.update($scope.event);
          var input = document.getElementById('adress-edit');
          input.value = $scope.event.adress;
        } else {
          window.alert('Aucun résultat trouvé');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }



  $scope.resizeTextarea = function(){
  	var element = document.getElementById("description-edit");
  	element.style.height = element.scrollHeight + "px";
  }
});
