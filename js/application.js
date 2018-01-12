//Array of Points of Interest displayed by default
var pois = [
  {
    name: 'Yutaka Hibachi',
    lat: 40.569244, lng: -74.614424
  },
  {
    name: 'Conlins Cafe & Bakery',
    lat: 40.568592, lng: -74.613394
  },
  {
    name: 'Retro Classics Video Games',
    lat: 40.568631, lng: -74.612866
  },
  {
    name: 'Verve Restaurant',
    lat: 40.568128, lng: -74.611212
  },
  {
    name: 'Alfonsos Family Trattoria',
    lat: 40.569903, lng: -74.616362
  },
  {
    name: 'Mannion\'s Pub',
    lat: 40.569210, lng: -74.614806
  },
  {
    name: 'Wolfgan\'s Steakhouse',
    lat: 40.569124, lng: -74.615428
  },
  {
    name: 'Cafe Picasso',
    lat: 40.569088, lng: -74.614302
  },
  {
    name: 'Starbucks',
    lat: 40.569360, lng: -74.615889
  }
];

//Class to handle POI information
POILocations = function(info) {
  var self = this;
  this.name = info.name;
  this.lat = info.lat;
  this.lng = info.lng;
  this.URL = '';
  this.street = '';
  this.city = '';
  this.phone = '';

  this.visible = ko.observable(true);

  //Foursquare Keys
  clientID = 'YA5YCGZRA414QRZ2HR4GG24H5Y45LNSLO02Z1C3BJ3N4CCWH';
  clientSecret = 'X50UXR4JITKLCC5VBEERFFT5LMGTTHIROU1ZDEZBFWMJEITO';

  var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20170413' + '&query=' + this.name;

  //jQuery call to get Foursqure information.
  $.ajaxSetup({ timeout: 3000 }); //Timeout after 3 seconds and display fail
    $.getJSON(foursquareURL).done(function (info) {
      var results = info.response.venues[0];
      if (typeof self.URL == 'undefined') {
        self.URL = 'This location has no website.';
      }
      else {
        self.URL = results.url;
      }
      self.street = results.location.formattedAddress[0] || '';
      self.city = results.location.formattedAddress[1] || '';
      self.phone = results.contact.phone || '';
    }).fail(function () {
      $('.list').html('An error occurred with the Foursqure API. Refresh this page and try again.');
    });

  //Create content for the InfoWindow
  this.infoWindow = new google.maps.InfoWindow({content: self.infoWindowContent});

  //Create the marker at its location
  this.marker = new google.maps.Marker({
    position: new google.maps.LatLng(info.lat, info.lng),
    map: map,
    title: info.name
  });

  //Display the InfoWindow when a marker or POI in the list is selected
  this.marker.addListener('click', function(){
    self.infoWindowContent = '<div><div><b>' + info.name + '</b></div>' +
    '<div><a target="_blank" href="' + self.URL +'">' + self.URL + "</a></div>" +
    '<div>' + self.street + '</div>' +
    '<div>' + self.city + '</div>' +
    '<div>' + self.phone +'</div></div>';
    self.infoWindow.setContent(self.infoWindowContent);
    self.infoWindow.open(map, this);
    self.marker.setAnimation(google.maps.Animation.DROP);
    self.marker.setIcon('https://www.google.com/mapfiles/marker_green.png');
  });

  // Makes the marker bounce animation whenever clicked.
  this.poiClicked = function(poi) {
    google.maps.event.trigger(self.marker, 'click');
  };
}; //POILocations class end

function ViewModel(){
  var self = this;
  this.poiQry = ko.observable('');
  this.listItem = ko.observableArray([]);

  //Add the map to the index.html page
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.568631, lng: -74.612866},
    zoom: 17,
    mapTypeControl: true,
      mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      mapTypeIds: ['roadmap', 'terrain']
      }
  });

  //Loop the POIs and process with POILocations
  pois.forEach(function(item){
    self.listItem.push( new POILocations(item));
  });

  //Filter POIs as the user types
  this.filteredPOIs = ko.computed( function() {
    var filter = self.poiQry().toLowerCase();
    if (!filter) {
      self.listItem().forEach(function(item){
        item.visible(true);
      });
      return self.listItem();
    } else {
      return ko.utils.arrayFilter(self.listItem(), function(item) {
        var string = item.name.toLowerCase();
        var result = (string.search(filter) >= 0);
        item.visible(result);
        return result;
      });
    }
  }, self);
} //ViewModel End

//onerror event called from API call
function displayError() {
  $('#map').html('An error occurred with the Google Maps API. Refresh this page and try again.');
}

//Open left navigation when "open" text is clicked
function openNav() {
  document.getElementById('sideNavBar').style.width = '250px';
}

//close left navigation when X is clicked
function closeNav() {
  document.getElementById('sideNavBar').style.width = '0';
}

//Create new ViewModel and map
function initMap() {
  ko.applyBindings(new ViewModel());
}
