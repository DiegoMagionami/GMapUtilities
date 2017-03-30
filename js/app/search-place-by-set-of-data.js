'use strict';

(function() {

    var gmap = new GMaps();
    var selector = document.getElementById('local-types');
    var selResults = document.getElementById('list-results');
    var panoramaContainer = document.getElementById('panorama-container');
    var center = {
        lat: 43.095013,
        lng: 12.3452191
    };

    var map = gmap.initMap(document.getElementById('map'), {
        center: center,
        zoom: 10
    });
    var geocoder = gmap.initGeocoder();


    var searchBySetOfData = {
        getData: function(selector) {
            var types = [];
            $.getJSON("sources/culture.json", function(json) {
                for (var i = 0; i < json.length; i++) {
                    if (types.indexOf(json[i].Tipologia) === -1) {
                        var opt = document.createElement('option');
                        opt.value = json[i].Tipologia;
                        opt.innerHTML = json[i].Tipologia;
                        selector.appendChild(opt);
                        types.push(json[i].Tipologia);
                    }
                }
            });
        }
    };

    searchBySetOfData.getData(selector);

    selector.addEventListener('change', function() {
        $.getJSON("sources/culture.json", function(json) {
            var sel = selector.options[selector.selectedIndex].value;

            for (var i = 0; i < json.length; i++) {
                if (sel === json[i].Tipologia) {
                    var newEl = document.createElement('a');
                    newEl.appendChild(document.createTextNode(json[i].Indirizzo + " " + json[i].Comune));
                    newEl.setAttribute("class", "list-group-item");
                    newEl.setAttribute("href", "#");
                    newEl.setAttribute("data-place", json[i].Indirizzo + " " + json[i].Comune);

                    selResults.appendChild(newEl);
                    //gmap.findPlace(json[i].Indirizzo + " " + json[i].Comune);

                    newEl.addEventListener('click', function(el) {
                        var _this = this;
                        _this.classList.add('active');
                        gmap.getCoords(_this.dataset.place, function(result) {
                            gmap.setPanorama(panoramaContainer, {
                                position: result,
                                pov: {
                                    heading: 34,
                                    pitch: 10
                                }
                            });
                        });

                    });
                }
            }

        });
    });
})();