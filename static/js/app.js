var sole = sole || {};

sole.course = sole.course || {};
sole.create = sole.create || {};
sole.map = sole.map || {};
sole.what = sole.what || {};

sole.create.visible = false;
sole.course.list = [];

sole.init = function() {
    sole.map.init();
    sole.course.get_courses();
    sole.setup_events();
    $('#what_input').focus();
    $('#what_input').on('change', sole.what.submit);
};

sole.map.init = function() {
    mapbox.load('shreyansb.map-d6wn3q7b', function(o) {
        var map = mapbox.map('map');
        map.centerzoom({ 
            lat: 40.73413893902268,
            lon: -73.92942245483398}, 
        13);
        map.addLayer(o.layer);
        sole.map.map = map;
    });
}

sole.setup_events = function() {
    $('#create_cancel').on('click', sole.create.hide);

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

sole.what.submit = function(event) {
    sole.create.show($('#what_input').val());
    return false;
};

// get a list of courses from the server
// populate the search bar with these results
// format them for later use
sole.course.get_courses = function() {
    $.get('/courses', function(data) {
        sole.course.list = $.parseJSON(data);
        console.log(sole.course.list);
        $('#what_input').select2({
            width: "600px",
            placeholder: "What class are you taking?",
            data: sole.course.list
        });
        sole.course.dict = sole.course.format(sole.course.list);
    });
};

// converts a list as expected by select2, so to a dictionary that
// allows for course lookup by id
sole.course.format = function(c) {
    var dict = {};
    for (var i=0; i < c.length; i++) {
        var o = c[i];
        dict[o['id']] = o;
    }
    return dict;
};

// Show the form to create a new activity
// Pre-fill the form if possible
sole.create.show = function(class_id) {
    sole.create.visible = true;
    sole.create.id = class_id;
    $('#create').show();
    var c = sole.course.dict[class_id];
    $('#class_name').text(c.name);
    $('#create_subject').focus();
};

// Hide the form to create a new activity
// Reset elements within this form, and on the homepage
sole.create.hide = function() {
    $('#create').hide();
    $('#create_form').find("input[type=text], select").val("");
    sole.create.visible = false;
    sole.create.id = undefined;
};

sole.create.submit = function(event) {
    var c = sole.course.dict[sole.create.id];
    var name = c.name;
    var d = $('#create_subject').val();
    var zip = $('#create_zipcode').val();
    var ppl = $('#create_ppl').val();
    var o = {
        'id': sole.create.id,
        'description': d,
        'zip': zip,
        'ppl': ppl
    };
    $.ajax({
        type: 'POST',
        url: '/courses',
        data: o,
        success: function(data) {
            console.log("added sole");
            console.log(data);
            sole.create.add_marker(zip, name, d);
        }
    });
    sole.create.hide();
    $('#what').hide();
};

sole.create.add_marker = function(zip, title, description) {
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
