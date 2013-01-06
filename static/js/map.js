sole.map = sole.map || {};

sole.map.init = function() {
    mapbox.load('shreyansb.map-d6wn3q7b', function(o) {
        var map = mapbox.map('map');
        map.centerzoom({ 
            lat: 40.73413893902268,
            lon: -73.92942245483398}, 
        13);
        map.addLayer(o.layer);
        sole.map.map = map;
        setTimeout(sole.map.load_recent, 1000);
    });
}

sole.map.load_recent = function() {
    $.get('/sole', function(data) {
        var soles = $.parseJSON(data);
        for (var i=0; i<soles.length; i++) {
            var s = soles[i];
            sole.map.add_marker(s.loc[0], s.loc[1], s.desc, s.course, false);
        }
    });
};

// Add a marker to the map
sole.map.add_marker = function(lat, lon, title, description, center) {
    if (typeof(sole.map.markers) === "undefined") {
        var markerLayer = mapbox.markers.layer();
        sole.map.map.addLayer(markerLayer);
        sole.map.markers = markerLayer;
    }
    sole.map.markers.add_feature({
        'geometry': {
            'coordinates': [lon, lat]
        },
        'properties': {
            'marker-color': '#000',
            'marker-symbol': 'star-stroked',
            'title': title,
            'description': description
        }
    });
    if (center) {
        sole.map.map.center({ lat: lat, lon: lon });
    }
};
