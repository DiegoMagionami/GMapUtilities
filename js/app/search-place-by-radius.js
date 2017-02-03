'use strict';

(function() {
    var rangeSlider = document.getElementById('slider-range');
    var rangeSliderValueElement = document.getElementById('slider-range-value');
    var center = {
        lat: 43.095013,
        lng: 12.3452191
    };
    var geo_options = {
        enableHighAccuracy: true,
        maximumAge        : 30000,
        timeout           : 27000
    };
    var gmap = new GMaps();

    noUiSlider.create(rangeSlider, {
        start: [ 1000 ],
        range: {
            'min': [  1000 ],
            'max': [ 50000 ]
        },
        step: 100
    });
    var distanceLimit = 1000;
    var map = null;

    var placeType = document.getElementById("search-place-type");
    var searchBox = document.getElementById('search-box');
    var currentLocationBox = document.getElementById('current-location-box');
    var btnLocate = document.getElementById('btn-locate');

    window.addEventListener('load', function() {
        getCurrentLocation(distanceLimit);
    }, false);

    rangeSlider.noUiSlider.on('update', function( values, handle ) {
        distanceLimit = (values[handle] / 1000).toFixed(3);
        rangeSliderValueElement.innerHTML = distanceLimit;
    });

    rangeSlider.noUiSlider.on('end', function( values, handle ) {
        distanceLimit = (values[handle] / 1000).toFixed(3);
        rangeSliderValueElement.innerHTML = distanceLimit;
        getCurrentLocation(distanceLimit);
    });

    function getCurrentLocation(distanceLimit) {

        gmap.getCurrentLocation(geo_options, function (val) {

            var center = new google.maps.LatLng(val.position.latitude, val.position.longitude);

            var autocomplete = gmap.initAutocomplete(
              searchBox,
              {
                  types: ['(cities)']
              }
            );

            if(document.getElementById('map').firstChild === null) {
                map = gmap.initMap(document.getElementById('map'), {
                    center: center,
                    zoom: 12
                });
            }

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

            var selectedPlace = placeType.options[placeType.selectedIndex].value;

            if(selectedPlace !== '0') {

                gmap.searchNearby(
                  {
                      bounds: map.getBounds(),
                      types: [selectedPlace]
                  },
                  {
                      multi: false,
                      containerEl: document.getElementById('results')
                  },
                  function (result) {
                      gmap.setPointsByDistanceLimit(result, center, distanceLimit);
                  })
            }
            placeType.addEventListener('change', function() {
                gmap.searchNearby(
                  {
                      bounds: map.getBounds(),
                      types: [this.options[this.selectedIndex].value]
                  },
                  {
                      multi: false,
                      containerEl: document.getElementById('results')
                  },
                  function (result) {
                      gmap.setPointsByDistanceLimit(result, center, distanceLimit);
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
