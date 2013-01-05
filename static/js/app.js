var sole = sole || {};
sole.create = sole.create || {};
sole.what = sole.what || {};
sole.map = sole.map || {};

sole.create.visible = false;
sole.verbs = ["make", "learn", "practice", "study", "explore"];

sole.init = function() {
    sole.map.init();
    sole.setup_events();
    sole.focus_on_what();
};

sole.map.init = function() {
    mapbox.load('shreyansb.map-d6wn3q7b', function(o) {
        var map = mapbox.map('map');
        map.centerzoom({ 
            lat: 40.732578012757486, 
            lon: -73.95431335449219}, 
        13);
        map.addLayer(o.layer);
        sole.map.map = map;
    });
}

sole.setup_events = function() {
    $('#create_button').on('click', function(event) {
        sole.create.show();
    });

    $('#create_cancel').on('click', function(event) {
        sole.create.hide();
    });

    $('#what_form').submit(function(event) {
        sole.what.submit(event);
        return false;
    });

    $('#create_form').submit(function(event) {
        sole.create.submit(event);
        return false;
    });

    $(document).bind('keydown', 'esc', function(event) {
        if (sole.create.visible === true) {
            sole.create.hide();
        }
    });
};

sole.focus_on_what = function() {
    $('#what_input').focus();
};

sole.what.submit = function(event) {
    var what_text = $('#what_input').val();
    var parsed = sole.what.parse(what_text);
    sole.create.show(parsed[0], parsed[1]);
};

sole.what.parse = function(what) {
    var verb, new_what;
    $.each(sole.verbs, function(index, value) {
        if (what.toLowerCase().indexOf(value) === 0) {
            verb = value;
            new_what = what.replace(/^[\w]+\s/, "");
            return false;
        }
    });
    if (typeof(new_what) === "undefined") {
        new_what = what;
    }
    return [verb, new_what];
};

// Show the form to create a new activity
// Pre-fill the form if possible
sole.create.show = function(verb, what) {
    $('#create').show();
    sole.create.visible = true;

    // verb
    if (typeof(verb) === "string") {
        $('#create_verb').val(verb);
    } else {
        console.log("focus on verb");
        $('#create_verb').focus();
    }

    if (typeof(what) === "string") {
        $('#create_title').val(what);
    }

    if (typeof(what) === "string" && typeof(verb) === "string") {
        console.log("focus on zipcode");
        $('#create_zipcode').focus();
    }
};

// Hide the form to create a new activity
// Reset elements within this form, and on the homepage
sole.create.hide = function() {
    $('#create').hide();
    $('#create_form').find("input[type=text], select").val("");
    $('#what_input').val("").focus();
    sole.create.visible = false;
};

sole.create.submit = function(event) {
    console.log(event);

    sole.create.add_marker();

    sole.create.hide();
    $('#what').hide();
};

sole.create.add_marker = function() {
    var title = $('#create_verb').val();
    var description = $('#create_title').val();
    var zip = $('#create_zipcode').val();

    $.get('zip/' + zip, function(data) {
        var loc = $.parseJSON(data);
        if (loc) {
            sole.map.add_marker(loc[0], loc[1], title, description);
        }
    });
};

// Add a marker to the map
sole.map.add_marker = function(lat, lon, title, description) {
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
    sole.map.map.centerzoom({ lat: lat, lon: lon }, 14);
};

// Start the app
$(document).ready(sole.init);
