var sole = sole || {};

sole.course = sole.course || {};
sole.create = sole.create || {};

sole.course.once = false;
sole.create.visible = false;
sole.course.list = [];
sole.show_map = false;

sole.init = function() {
    if (sole.show_map) {
        sole.map.init();
    }
    sole.course.get_courses();
    sole.setup_events();
    $('#course_input').on('change', sole.course.submit);
    sole.create.setup_form();
    sole.load_deferred_images();
};

sole.load_deferred_images = function() {
    var imgs = $('img[data-src]');
    $.each(imgs, function(i, v) {
        var e = $(v);
        if ((e.attr('data-src')).indexOf("{{{") != 0) {
            e.attr('src', e.attr('data-src'));  
        }
    });
};

sole.setup_events = function() {
    $('#create_start').on('click', sole.create.show);
    $('#create_cancel').on('click', sole.create.hide);
    $('#create_submit').submit(function(event) {
        sole.create.submit(event);
        return false;
    });
    $('#create_submit').on('click', sole.create.submit);

    $(document).bind('keydown', 'esc', function(event) {
        if (sole.create.visible === true) {
            sole.create.hide();
        }
    });

    $('#create_find_location').on('click', sole.loc.request);
};

sole.course.submit = function(event) {
    sole.map.reset_markers();
    sole.create.hide();
    sole.course.reset_results();

    // if this is the first submit, we move the elements around
    if (sole.course.once === false) {
        sole.course.animate_up();
        sole.course.once = true;
    }

    // on every submit, get new results
    $.get('/course/' + sole.course.get_id() + '/sole', function(data) {
        var results = $.parseJSON(data);
        if (results.length > 0) {
            sole.course.show_results();
            var template = $('template#results_row').html();
            for (var i=0; i<results.length; i++) {
                results[i]['counter'] = i+1;
                sole.course.add_result(template, results[i]);
            }
            sole.load_deferred_images();
        } else {
            sole.course.no_results();
        }
    });

    return false;
};

sole.course.no_results = function() {
    $('<div/>', {
        "class": "result",
        text: "no results",
        display: "none"
    }).appendTo('#results').fadeIn(150);
};

sole.course.reset_results = function() {
    $('#results').find('div').remove();
};

sole.course.hide_results = function() {
    $('#results').hide();
};

sole.course.show_results = function() {
    $('#results').show();
};

sole.course.add_result = function(t, r) {
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

sole.course.animate_up = function() {
    $('#course').find('h1').fadeOut(150);
    $('#course').find('h2').fadeOut(150);
    $('#sidebar').animate({ top: "10%" }, 200); 
    setTimeout(function() {
        $('#results').fadeIn(150);
        $('#create_actions').fadeIn(150);
    }, 150);
};

sole.course.get_id = function() {
    return $('#course_input').val();
}

// get a list of courses from the server
// populate the search bar with these results
// format them for later use
sole.course.get_courses = function() {
    $.get('/course', function(data) {
        sole.course.list = $.parseJSON(data);
        $('#course_input').select2({
            width: "600px",
            placeholder: "What class are you taking?",
            data: sole.course.list
        });
        $('#course_input').select2("focus");
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

sole.create.update_with_lat_lon = function(lat, lon) {
    $('#create_find_location').hide();
    $('#create_enter_location').val(lat + ", " + lon);
};

sole.create.setup_form = function() {
    $('#create_day').select2({
        width: '250px',
        allowClear: true,
        placeholder: "What day are you available?",
        data: sole.create.days(),
        initSelection: function() {}
    });
    $('#create_time').select2({
        width: '150px',
        allowClear: true,
        placeholder: "At what time?",
        data: sole.data.hours,
        initSelection: function() {}
    });
};

// validate inputs and submit form to create a new sole
sole.create.submit = function(e) {
    if (!sole.create.validate()) {
        console.log("validation failed");
        return false;
    }

    var params = {
        'day': $('#create_day').val(),
        'time':  $('#create_time').val(),
        'lat': sole.loc.current[0],
        'lon': sole.loc.current[1],
        'course_id': sole.course.get_id()
    }
    console.log(params);

    $.ajax({
        url: '/sole',
        type: 'POST',
        data: params,
        success: sole.create.success,
        error: sole.create.error
    });
};

sole.create.success = function(e) {
    $('#create_form_message').text("Done!");
};

sole.create.error = function(e) {
    $('#create_form_message').text("Sorry, there was error.");
};

sole.create.validate = function(e) {
    var create_error_class = "create_form_error";
    var error = false;

    // get day
    if ($('#create_day').val() === "") {
        $('#s2id_create_day').addClass(create_error_class);
        error = true;
    }

    // get time
    if ($('#create_time').val() === "") {
        $('#s2id_create_time').addClass(create_error_class);
        error = true;
    }

    var l = sole.loc.current;
    // get location
    if (typeof(l) === "undefined") {
        var success = sole.loc.find_entered_location();
        if (!success) {
            $('#create_enter_location').addClass(create_error_class);
            error = true;
        }
    }
    if (error) {
        $('#create_form_message').text('Oops, there was an error');
        return false;
    }
    return true;
}

sole.create.show = function() {
    $('#create').show();
    $('#create_cancel').show();
    $('#create_submit').show();
    $('#create_start').hide();
    $('#create_call_to_action').hide();
    sole.create.visible = true;
    sole.course.hide_results();
};

sole.create.hide = function() {
    $('#create').hide();
    $('#create_cancel').hide();
    $('#create_submit').hide();
    $('#create_start').show();
    $('#create_call_to_action').show();
    $('#create_form').each(function() { this.reset();} );
    sole.create.visible = false;
    $('#create_day').select2('val', '');
    $('#create_time').select2('val', '');
    $('#create_enter_location').val('');
    $('#create_find_location').show();
    sole.course.show_results();
};

// return a list of the days of the coming 2 weeks,
// to be used by the create form dropdown
sole.create.days = function() {
    var days = [];
    for (var i=0; i<14; i++) {
        var m = moment().add('days', i);
        days.push({'id':m.format(), 'text': m.format('dddd, Do MMMM')})
    }
    return days
};

// Start the app
$(document).ready(sole.init);
