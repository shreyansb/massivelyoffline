var sole = sole || {};

sole.course = sole.course || {};
sole.create = sole.create || {};
sole.cls = sole.cls || {};

sole.cls.once = false;
sole.create.visible = false;
sole.course.list = [];
sole.show_map = false;

sole.init = function() {
    if (sole.show_map) {
        sole.map.init();
    }
    sole.course.get_courses();
    sole.setup_events();
    $('#cls_input').focus();
    $('#cls_input').on('change', sole.cls.submit);
};

sole.setup_events = function() {
    $('#create_start').on('click', sole.create.show);
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

sole.cls.submit = function(event) {
    sole.map.reset_markers();
    sole.cls.reset_results();

    // if this is the first submit, we move the elements around
    if (sole.cls.once === false) {
        sole.cls.animate_up();
        sole.cls.once = true;
    }

    // on every submit, get new results
    var class_id = sole.cls.get_class_id();
    $.get('/sole/' + class_id, function(data) {
        var results = $.parseJSON(data);
        if (results.length > 0) {
            sole.cls.show_results();
            var template = $('template#results_row').html();
            for (var i=0; i<results.length; i++) {
                results[i]['counter'] = i+1;
                sole.cls.add_result(template, results[i]);
            }
        } else {
            sole.cls.no_results();
        }
    });

    return false;
};

sole.cls.no_results = function() {
    $('<div/>', {
        "class": "result",
        text: "no results",
        display: "none"
    }).appendTo('#results').fadeIn(150);
};

sole.cls.reset_results = function() {
    $('#results').find('div').remove();
};

sole.cls.hide_results = function() {
    $('#results').hide();
};

sole.cls.show_results = function() {
    $('#results').show();
};

sole.cls.add_result = function(t, r) {
    // render results row from template
    var output = Mustache.render(t, r);
    $('<div/>', {
        id: r.id,
        "class": "result",
        html: output,
        display: "none"
    }).appendTo('#results').fadeIn(150);

    // add marker to map
    if (sole.show_map) {
        sole.map.add_marker(r.loc.lat, r.loc.lon, "result", i, false);
    }
};

sole.cls.animate_up = function() {
    $('#cls').find('h1').fadeOut(150);
    $('#cls').find('h2').fadeOut(150);
    $('#sidebar').animate({ top: "10%" }, 200); 
    setTimeout(function() {
        $('#results').fadeIn(150);
        $('#create_actions').fadeIn(150);
    }, 150);
};

sole.cls.get_class_id = function() {
    return $('#cls_input').val();
}

// get a list of courses from the server
// populate the search bar with these results
// format them for later use
sole.course.get_courses = function() {
    $.get('/courses', function(data) {
        sole.course.list = $.parseJSON(data);
        $('#cls_input').select2({
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

sole.create.show = function() {
    $('#create').show();
    $('#create_cancel').show();
    $('#create_submit').show();
    $('#create_start').hide();
    $('#create_call_to_action').hide();
    sole.cls.hide_results();
};

sole.create.hide = function() {
    $('#create').hide();
    $('#create_cancel').hide();
    $('#create_submit').hide();
    $('#create_start').show();
    $('#create_call_to_action').show();
    sole.cls.show_results();
};

/*
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
    console.log(o);
    $.ajax({
        type: 'POST',
        url: '/sole',
        data: o,
        success: function(data) {
            console.log("added sole");
            console.log(data);
            sole.create.add_marker(zip, name, d);
        }
    });
    sole.create.hide();
    $('#cls').hide();
};
*/

// Start the app
$(document).ready(sole.init);
