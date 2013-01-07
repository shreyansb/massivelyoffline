sole.map = sole.map || {};
sole.map.default_lat = 40.73413893902268;
sole.map.default_lon = -73.92942245483398;
sole.map.base_map_id = 'shreyansb.map-d6wn3q7b';
sole.map.streets_map_id = 'shreyansb.map-1btgpwx1';

sole.map.init = function() {
    mapbox.load(sole.map.base_map_id, function(o) {
        var map = mapbox.map('map');
        map.centerzoom({lat: sole.map.default_lat, lon: sole.map.default_lon}, 13);
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

sole.map.add_streets = function() {
    if (typeof(sole.map.streets) === "undefined") {
        console.log("getting streets");
        sole.map.streets = mapbox.layer().id(sole.map.streets_map_id, sole.map.streets_loaded);
        return true;
    } else { return false; }
};

sole.map.streets_loaded = function(layer) {
    console.log("adding streets");
    sole.map.map.addTileLayer(layer);
};

sole.map.remove_streets = function() {
    if (typeof(sole.map.streets) != "undefined") {
        console.log("removing streets");
        sole.map.map.removeLayer(sole.map.streets);
        sole.map.streets = undefined;
    }
};

// Add a marker to the map
sole.map.add_marker = function(lat, lon, title, description, center) {
    if (typeof(sole.map.markers) === "undefined") {
        var markerLayer = mapbox.markers.layer();
        sole.map.map.addLayer(markerLayer);
        sole.map.markers = markerLayer;
        var interaction = mapbox.markers.interaction(markerLayer);
        interaction.showOnHover(true);
        sole.map.interaction = interaction;
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

sole.map.add_marker_from_zip = function(zip, title, description) {
    $.get('zip/' + zip, function(data) {
        var loc = $.parseJSON(data);
        if (loc) {
            sole.map.add_marker(loc[0], loc[1], title, description);
        }
    });
};

// clear the map of all markers
sole.map.reset_markers = function() {
    if (typeof(sole.map.markers) != "undefined") {
        sole.map.map.removeLayer(sole.map.markers.name);
        sole.map.markers = undefined;
    }
};
