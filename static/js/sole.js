sole.sole = sole.sole || {};

sole.sole.once = false;
sole.sole.list = [];

sole.sole.submit = function(event) {
    sole.map.reset_markers();
    sole.create.hide();
    sole.sole.reset_results();

    // if this is the first submit, we move the elements around
    if (sole.sole.once === false) {
        sole.sole.animate_up();
        sole.sole.once = true;
    }

    // on every submit, get new results
    $.get('/course/' + sole.sole.get_id() + '/sole', function(data) {
        var results = $.parseJSON(data);
        if (results.length > 0) {
            sole.sole.show_results();
            var template = $('template#results_row').html();
            for (var i=0; i<results.length; i++) {
                var r = sole.sole.format_result_for_template(results[i], i);
                sole.sole.add_result(template, r);
            }
            sole.load_deferred_images();
        } else {
            sole.sole.no_results();
        }
    });

    return false;
};

sole.sole.format_result_for_template = function(r, i) {
    r['counter'] = i+1;
    if (window.sole_facebook_id) {
        for (var j=0; j<r['students'].length; j++) {
            if (r['students'][j]['facebook_id'] == window.sole_facebook_id) {
                r['user_is_student'] = true;
            }
        }
    }
    console.log(r);
    return r;
};

sole.sole.no_results = function() {
    $('<div/>', {
        "class": "result no_result",
        html: "<p>Nothing yet.</p>",
        display: "none"
    }).appendTo('#results').fadeIn(150);
};

sole.sole.reset_results = function() {
    $('#results').find('div').remove();
};

sole.sole.hide_results = function() {
    $('#results').hide();
};

sole.sole.show_results = function() {
    $('#results').show();
};

sole.sole.add_result = function(t, r) {
    // render results row from template
    r['day'] = moment(r['day']).format('dddd, Do MMMM');
    var output = Mustache.render(t, r);
    var el = $('<div/>', {
        id: r.id,
        "class": "result",
        html: output,
        display: "none"
    }).appendTo('#results').fadeIn(150);
    el.find('.join_sole').on('click', sole.sole.confirm_join_sole);

    // add marker to map
    if (sole.show_map) {
        sole.map.add_marker(r.lat, r.lon, "", "", false);
    }
};

sole.sole.animate_up = function() {
    $('#course').find('h1').fadeOut(150);
    $('#course').find('h2').fadeOut(150);
    $('#sidebar').animate({ top: "10%" }, 200); 
    setTimeout(function() {
        $('#results').fadeIn(150);
        $('#create_actions').fadeIn(150);
    }, 150);
};

sole.sole.get_id = function() {
    return $('#course_input').val();
}

// get a list of courses from the server
// populate the search bar with these results
// format them for later use
sole.sole.get_courses = function() {
    $.get('/course', function(data) {
        sole.sole.list = $.parseJSON(data);
        $('#course_input').select2({
            width: "600px",
            placeholder: "What class are you taking?",
            data: sole.sole.list
        });
        $('#course_input').select2("focus");
        sole.sole.dict = sole.sole.format(sole.sole.list);
    });
};

// converts a list as expected by select2, so to a dictionary that
// allows for course lookup by id
sole.sole.format = function(c) {
    var dict = {};
    for (var i=0; i < c.length; i++) {
        var o = c[i];
        dict[o['id']] = o;
    }
    return dict;
};

sole.sole.join_success = function(data) {
    console.log("join success");
    console.log(data);
    var j = $.parseJSON(data);
    var id = j.id;
    var result = $('#'+id);
    var facebook_id = j.facebook_id;

    // add the student's picture to the row
    var el = $('<img/>', {
        'src': sole.fb.image_url_from_id(facebook_id)
    });
    result.find('.sole_people').append(el);

    // remove join button
    result.find('.join_sole').remove();
};

sole.sole.join_error = function(data) {
    console.log("course: join_error");
};

sole.sole.login_error = function(id) {
    console.log("course: login_error");
};

sole.sole.join_sole = function(id) {
    console.log("course: join_sole");
    var params = {
        'id': id,
        'facebook_access_token': sole.fb.resp.authResponse.accessToken
    };
    $.ajax({
        'url': '/sole/'+id+'/join',
        'type': 'PUT',
        'data': params,
        'success': sole.sole.join_success,
        'error': sole.sole.join_error
    });
    $('#'+id).find('div.result_overlay').remove();
};

sole.sole.confirm_join_sole = function(e) {
    console.log("course: confirm_join_sole");

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
        console.log("course: confirm_join_sole: yes");
        sole.fb.login_status(sole.sole.join_sole, sole.sole.login_error, id);
        return false;
    });

    $(no_id).on('click', function(e) {
        console.log("course: confirm_join_sole: no");
        $(this).parent().parent().remove();
        return false;
    });
    return false;
};


