'use strict';

(function() {
    var gmap = new GMaps();

    var rangeSlider = document.getElementById('slider-range');
    var rangeSliderValueElement = document.getElementById('slider-range-value');
    var placeType = document.getElementById("search-place-type");
    var searchBox = document.getElementById('search-box');
    var currentLocationBox = document.getElementById('current-location-box');
    var btnLocate = document.getElementById('btn-locate');

    var center = gmap.getLatLngObject(43.095013, 12.3452191);
    var defaultPosition = gmap.getLatLngObject(40.705565, 74.1180849);

    var geo_options = {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
    };
    var markers = [];
    var distanceLimit = 1000;
    var map = null;

    noUiSlider.create(rangeSlider, {
        start: [1000],
        range: {
            'min': [1000],
            'max': [50000]
        },
        step: 100
    });

    window.addEventListener('load', function() {
        getCurrentLocation(distanceLimit);
    }, false);

    rangeSlider.noUiSlider.on('update', function(values, handle) {
        distanceLimit = (values[handle] / 1000).toFixed(3);
        rangeSliderValueElement.innerHTML = distanceLimit;
    });

    rangeSlider.noUiSlider.on('end', function(values, handle) {
        distanceLimit = (values[handle] / 1000).toFixed(3);
        rangeSliderValueElement.innerHTML = distanceLimit;
        getCurrentLocation(distanceLimit);
    });

    function getCurrentLocation(distanceLimit) {

        gmap.getCurrentLocation(geo_options, function(val) {

            var center = val.error !== '' ?
                defaultPosition : gmap.getLatLngObject(val.position.latitude, val.position.longitude);

            var autocomplete = gmap.initAutocomplete(
                searchBox, {
                    types: ['(cities)']
                }
            );

            if (document.getElementById('map').firstChild === null) {

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
                    var image = {
                        url: place.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    };
                    var newMarker = gmap.generateMarker({ map: map });
                    newMarker.setVisible(false);
                    map.panTo(place.geometry.location);
                    map.setZoom(12);
                    newMarker.setPosition(place.geometry.location);
                    newMarker.setIcon(image),
                        newMarker.setVisible(true);
                }
            });

            var selectedPlace = placeType.options[placeType.selectedIndex].value;

            if (selectedPlace !== '0') {
                gmap.searchNearby({
                        bounds: map.getBounds(),
                        types: [placeType.options[placeType.selectedIndex].value]
                    }, {
                        multi: false,
                        containerEl: document.getElementById('results')
                    },
                    function(result) {
                        gmap.setPointsByDistanceLimit(result, center, distanceLimit);
                    });
            }

            placeType.addEventListener('change', function() {
                gmap.searchNearby({
                        bounds: map.getBounds(),
                        types: [this.options[this.selectedIndex].value]
                    }, {
                        multi: false,
                        containerEl: document.getElementById('results')
                    },
                    function(result) {
                        gmap.setPointsByDistanceLimit(result, center, distanceLimit);
                    });
            });

            gmap.reverseGeocoding(center, function(result) {
                if (result !== undefined) {
                    currentLocationBox.value = result[0].formatted_address;
                }
            });

        });
    }

    function getPhotos(photos) {
        var result = '';
        if (photos !== undefined && photos.length > 0) {
            for (var i = 0; i < photos.length; i++) {
                if (photos[i] !== undefined)
                    result += '<img src="' + photos[i].getUrl({ maxWidth: 150 }) + '" />';
            }
        }

        return result;
    }
})();