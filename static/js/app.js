var sole = sole || {};

sole.course = sole.course || {};

sole.course.once = false;
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
    sole.create.events();
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
        "class": "result no_result",
        html: "<p>Nothing yet.</p>",
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
    r['day'] = moment(r['day']).format('dddd, Do MMMM');
    var output = Mustache.render(t, r);
    var el = $('<div/>', {
        id: r.id,
        "class": "result",
        html: output,
        display: "none"
    }).appendTo('#results').fadeIn(150);
    el.find('.join_sole').on('click', sole.course.confirm_join_sole);

    // add marker to map
    if (sole.show_map) {
        sole.map.add_marker(r.lat, r.lon, "", "", false);
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

sole.course.join_success = function(data) {

};

sole.course.join_error = function(data) {

};

sole.course.join_sole = function(id) {
    console.log("joining sole");
    var params = {'id': id};
    $.ajax({
        'url': '/sole/'+id+'/join',
        'type': 'PUT',
        'data': params,
        'success': sole.course.join_success,
        'error': sole.course.join_error
    });
};

sole.course.confirm_join_sole = function(e) {
    console.log("got a click");
    // add overlay to the result
    var id = $(this).parent().parent().attr('id');

    var d = {'id': id};
    var t = $('template#result_overlay').html();
    var output = Mustache.render(t, d);

    var el = $('<div/>', {
        "class": "result_overlay",
        html: output
    }).appendTo('#'+id);

    var yes_id = "#yes_" + id;
    var no_id = "#no_" + id;

    $(yes_id).on('click', function(e) {
        $(this).parent().parent().remove();
        sole.course.join_sole(id);
        return false;
    });

    $(no_id).on('click', function(e) {
        $(this).parent().parent().remove();
        return false;
    });
    return false;
};

// Start the app
$(document).ready(sole.init);
