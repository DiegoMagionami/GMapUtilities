'use strict';

(function() {

    var geo_options = {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
    };
    var defaultPosition = {
        lat: 40.705565,
        lng: 74.1180849
    };
    var markers = [];
    var gmap = new GMaps();

    var placeType = document.getElementById("place-type");
    var placeSearch = document.getElementById("search-place");
    var searchBox = document.getElementById('search-box');
    var currentLocationBox = document.getElementById('current-location-box');
    var btnLocate = document.getElementById('btn-locate');

    btnLocate.addEventListener('click', getCurrentLocation);
    window.addEventListener('load', getCurrentLocation);

    function getCurrentLocation() {

        gmap.getCurrentLocation(geo_options, function(val) {

            var center = val.error !== '' ?
                defaultPosition : {
                    lat: val.position.latitude,
                    lng: val.position.longitude
                };

            var autocomplete = gmap.initAutocomplete(
                searchBox, {
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

            placeSearch.addEventListener('click', function() {
                gmap.searchNearby({
                        bounds: map.getBounds(),
                        types: [placeType.options[placeType.selectedIndex].value]
                    }, {
                        multi: false,
                        containerEl: document.getElementById('results')
                    },
                    function(points) {
                        gmap.clearMarkers(markers);
                        for (var i = 0; i < points.length; i++) {
                            markers[i] = gmap.generateMarker({
                                position: points[i].geometry.location,
                                animation: google.maps.Animation.DROP
                            });

                            markers.placeResult = points[i];
                            var photos = getPhotos(points[i].photos);

                            gmap.setInfoWindow(markers[i], points[i].name + "<br />" + photos);
                            setTimeout(gmap.dropMarker(markers, i, map), i * 100);
                            gmap.addResult(points[i], i);
                        }
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