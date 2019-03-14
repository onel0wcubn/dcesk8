var infowindow;
var map;

var url = new URL(window.location.href);
var latitudeOpen = url.searchParams.get("lat")
var longitudeOpen = url.searchParams.get("long")

// run when page loads
$(() => {
  $("#info-toggle").click(function() {
    $("#info-icons").slideToggle(),$(this).toggleClass("open"),$(this).hasClass("open")?$("#info-label").text("Hide Map Info"):$("#info-label").text("Show Map Info")
  });
})

function initMap() {
  infowindow = new google.maps.InfoWindow();

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: new google.maps.LatLng(38.8976755, -77.0365298),
    //mapTypeId: google.maps.MapTypeId.TERRAIN,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true,
    //gestureHandling: 'cooperative'
    gestureHandling: 'greedy'
    //gestureHandling: 'none'
  });

  // Try HTML5 geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var initialLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      map.setCenter(initialLocation);

      var myMarker = new google.maps.Marker({
        position: initialLocation,
        map: map,
        title: "My position!",
        icon: "images/bluedot.png",
        flat: true
      });
    });
  }

  var script = document.createElement('script');
  script.src = 'https://nyceboarding-bot.herokuapp.com/source.js';
  document.getElementsByTagName('head')[0].appendChild(script);
}

var markerOpen = "";
var detailsOpen = "";

window.eqfeed_callback = function (results) {
  for (var i = 0; i < results.length; i++) {
    var id = results[i].id;
    var latLng = new google.maps.LatLng(results[i].latitude, results[i].longitude);
    var type = results[i].type === null ? "-" : results[i].type;
    var is24h = results[i].is24h === null ? "-" : results[i].is24h;
    var author = results[i].author;
    var date_created = new Date(results[i].date_created);
    var description = results[i].description === null ? "-" : results[i].description;
    var photo_url = results[i].photo_url;

    var icon = 'images/icons/icon-power-gray.png'
    if (type === "Indoor" && is24h === "Yes") {
      icon = 'images/icons/icon-power-yellow.png'
    } else if (type === "Indoor" && is24h === "No") {
      icon = 'images/icons/icon-power-green.png'
    } else if (type === "Outdoor" && is24h === "Yes") {
      icon = 'images/icons/icon-power-blue.png'
    } else if (type === "Outdoor" && is24h === "No") {
      icon = 'images/icons/icon-power-orange.png'
    }

    var details = ""
    if (photo_url != null) {
      details = details + "<img style='max-width:300px;max-height:300px;' src='" + photo_url + "'></img> <br>"
    }

    details = details + "<b>Charge spot</b>: #" + id + "<br>"
    details = details + "<b>Type</b>: " + type + "<br>"
    details = details + "<b>24h</b>: " + is24h + "<br>"
    details = details + "<b>Description</b>: " + description + "<br>"
    details = details + "<b>Author</b>: " + author + "<br>"
    details = details + "<b>Date</b>: " + date_created.toLocaleString();

    var marker = new google.maps.Marker({
      position: latLng,
      map: map,
      title: "Charge spot #" + id,
      icon: icon,
      flat: true
    });

    bindInfoWindow(marker, map, infowindow, details);

    if (latitudeOpen != null
      && latitudeOpen != ""
      && latitudeOpen === results[i].latitude
      && longitudeOpen != null
      && longitudeOpen != ""
      && longitudeOpen === results[i].longitude) {
      markerOpen = marker
      detailsOpen = details
    }
  }

  if (detailsOpen != "" && markerOpen != "") {
    infowindow.setContent(detailsOpen);
    infowindow.open(map, markerOpen);
  }
}

function bindInfoWindow(marker, map, infowindow, strDescription) {
  google.maps.event.addListener(marker, 'click', function () {
    infowindow.setContent(strDescription);
    infowindow.open(map, marker);
  });
}