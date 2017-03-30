var geo_options = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 27000
};

(function() {

    var gmap = new GMaps();

    var center = {
        lat: 43.095013,
        lng: 12.3452191
    };

    var map = gmap.initMap(document.getElementById('map'), {
        center: center,
        zoom: 6
    });
    displayHeatMap();

    function displayHeatMap() {
        map.data.setStyle(function() {
            icon: getCircle()
        });

        getData(function(data) {
            var heatmapData = [];
            var locations = [];
            for (var i = 0; i < data.features.length; i++) {
                var coords = data.features[i].geometry.coordinates;
                var latLng = new google.maps.LatLng(coords[1], coords[0]);
                locations.push((latLng));
                heatmapData.push({ location: latLng, weight: data.features[i].properties.Magnitudo });
            }

            var markers = locations.map(function(location, i) {
                return gmap.generateMarker({
                    position: location
                });
            });

            gmap.initMarkerCluster(markers, {
                imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
            });

            var heatmap = gmap.initHeatMap({
                data: heatmapData,
                dissipating: true,
                radius: 15,
                opacity: 0.6,
                map: map
            });
        });
    }

    function getData(callback) {
        map.data.setStyle({
            icon: getCircle()
        });

        $.getJSON("sources/earthquake.json").then(function(data) {
            return callback(data);
        });
    }

    function getCircle(magnitude) {
        return {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: 'red',
            fillOpacity: .2,
            scale: Math.pow(2, magnitude) / 2,
            strokeColor: 'white',
            strokeWeight: .5
        };
    }



})();