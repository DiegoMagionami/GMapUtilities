'use strict';

(function() {

    var geo_options = {
        enableHighAccuracy: true,
        maximumAge        : 30000,
        timeout           : 27000
    };
    var gmap = new GMaps();

    var placeType = document.getElementById("search-place-type");
    var searchBox = document.getElementById('search-box');
    var currentLocationBox = document.getElementById('current-location-box');
    var btnLocate = document.getElementById('btn-locate');

    btnLocate.addEventListener('click', getCurrentLocation);
    window.addEventListener('load', getCurrentLocation);

    function getCurrentLocation() {

        gmap.getCurrentLocation(geo_options, function (val) {
            var center = {
                lat: val.position.latitude,
                lng: val.position.longitude
            };

            var autocomplete = gmap.initAutocomplete(
              searchBox,
              {
                  types: ['(cities)']
              }
            );
            var map = gmap.initMap(document.getElementById('map'), {
                center: center,
                zoom: 12
            });
            var places = gmap.initPlaces(map);
            var geocoder = gmap.initGeocoder(map);
            var marker = gmap.initMarker({
                position: center,
                map: map
            });

            autocomplete.addListener('place_changed', function() {
                var place = autocomplete.getPlace();
                if (place.geometry) {
                    var newMarker = gmap.generateMarker({map:map});
                    newMarker.setVisible(false);
                    map.panTo(place.geometry.location);
                    map.setZoom(12);
                    newMarker.setPosition(place.geometry.location);
                    newMarker.setVisible(true);
                }
            });


            placeType.addEventListener('change', function() {
                gmap.searchNearby(
                  {
                      bounds: map.getBounds(),
                      types: [this.options[this.selectedIndex].value]
                  },
                  {
                      multi: false,
                      containerEl: document.getElementById('results')
                  });
            });

            gmap.reverseGeocoding(center, function(result) {
                if(result !== undefined) {
                    currentLocationBox.value = result[0].formatted_address;
                }
            });

        });
    }
})();
