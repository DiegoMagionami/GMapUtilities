'use strict';
function GMaps() {
    this._map;
    this._autocomplete;
    this._place;
    this._marker;
    this._markers = [];
    this._geocoder;
    this._markerCluster;
    this._heatMap;

    this.initMap = function (container, options) {
        this._map = new google.maps.Map(container, options);
        return this._map;
    };

    this.initPlaces = function () {
        this._place = new google.maps.places.PlacesService(this._map);
        return this._place;
    };

    this.initMarker = function (options) {
        this._marker = this.generateMarker(options);
        return this._marker;
    };

    this.initAutocomplete = function (container, options) {
        this._autocomplete = new google.maps.places.Autocomplete(
          (container), options);

        return this._autocomplete;

    };

    this.initGeocoder = function () {
        this._geocoder = new google.maps.Geocoder();
        return this._geocoder;
    };

    this.setPanorama = function (container, options) {
        if(!this._map) {
            console.log('You must init place');
            return;
        }
        var panorama = new google.maps.StreetViewPanorama(container, options);
        this._map.setStreetView(panorama);
    };

    this.initMarkerCluster = function(markers, options) {
        if(!this._map) {
            console.log('You must init map');
        }
        this._markerCluster = new MarkerClusterer(this._map, markers, options);
    };

    this.initHeatMap = function(options) {
        this._heatMap = new google.maps.visualization.HeatmapLayer(options);
        return this._heatMap;
    };

    this.getCurrentLocation = function (options, callback) {
        var result = {
            error: '',
            position: ''
        };

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function(r) {
                  result.position = r.coords;
                  callback(result);
              },
              function (error) {
                  result.error = 'ERROR(' + error.code + '): ' + error.message;
                  callback(result);
              },
              options);
        } else {
            result.error = 'No position Available';
            callback(result);
        }
    };

    this.searchNearby = function (search, multiplePlaces) {
        if(!this._place) {
            console.log('You must init place');
            return;
        }
        var c = this;
        this._place.nearbySearch(search, function(results, status) {

            if (status === google.maps.places.PlacesServiceStatus.OK) {
                if(multiplePlaces.multi !== undefined && multiplePlaces.multi === false) {
                    c.clearResults(multiplePlaces.containerEl);
                    c.clearMarkers(c.markers);
                }

                for (var i = 0; i < results.length; i++) {
                    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
                    c._markers[i] = c.generateMarker({
                        position: results[i].geometry.location,
                        animation: google.maps.Animation.DROP
                    });
                    c._markers[i].placeResult = results[i];
                    //google.maps.event.addListener(markers[i], 'click', showInfoWindow);
                    setTimeout(c.dropMarker(c._markers, i, c._map), i * 100);
                    c.addResult(results[i], i);
                }
            }

        });
    };

    this.getCoords = function (address, callback) {
        if(!this._geocoder) {
            console.log('You must init geocoder');
            return;
        }
        this._geocoder.geocode({
            'address': address
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
                    callback(results[0].geometry.location);
                }
            }
        });
    };

    this.findPlace = function (address) {
        if(!this._geocoder) {
            console.log('You must init geocoder');
            return;
        }
        var $this = this;
        this._geocoder.geocode({
            'address': address
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
                    $this._map.setCenter(results[0].geometry.location);

                    var infowindow = new google.maps.InfoWindow({
                        content: '<b>' + address + '</b>',
                        size: new google.maps.Size(150, 50)
                    });

                    var marker = $this.generateMarker({
                        position: results[0].geometry.location,
                        map: $this._map,
                        title: address
                    });
                    google.maps.event.addListener(marker, 'click', function() {
                        infowindow.open($this._map, marker);
                    });

                } else {
                    alert("No results found");
                }
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    };

    this.reverseGeocoding = function (coords, callback) {
        if(!this._geocoder) {
            console.log('You must init geocoder');
            return;
        }

        this._geocoder.geocode({'location': coords}, function(results, status) {
            if (status === 'OK') {
                callback(results);
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    };

    this.addResult = function(result, i) {
        var results = document.getElementById('results');
        var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));

        var tr = document.createElement('tr');
        tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
        tr.onclick = function() {
            google.maps.event.trigger(markers[i], 'click');
        };

        var iconTd = document.createElement('td');
        var nameTd = document.createElement('td');
        var icon = document.createElement('img');
        icon.setAttribute('class', 'placeIcon');
        icon.setAttribute('className', 'placeIcon');
        var name = document.createTextNode(result.name);
        iconTd.appendChild(icon);
        nameTd.appendChild(name);
        tr.appendChild(iconTd);
        tr.appendChild(nameTd);
        results.appendChild(tr);
    };

    this.generateMarker = function (map) {
        return new google.maps.Marker(map);
    };

    this.dropMarker = function(markers, i, map) {
        return function() {
            markers[i].setMap(map);
        };
    };

    this.clearResults = function (el) {
        var results = el;
        while (results.childNodes[0]) {
            results.removeChild(results.childNodes[0]);
        }
    };

    this.clearMarkers = function (markers) {
        if(markers !== undefined && markers.length > 0) {
            for (var i = 0; i < markers.length; i++) {
                if (markers[i]) {
                    markers[i].setMap(null);
                }
            }
        }
    };

}