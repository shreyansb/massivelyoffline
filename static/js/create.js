sole.create = sole.create || {};
sole.create.visible = false;

sole.create.events = function() {
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

sole.create.update_ui_with_loc = function(lat, lon) {
    $('#create_find_location').hide();
    $('#create_enter_location').val(lat.toFixed(4) + ", " + lon.toFixed(4));
    sole.loc.data_for_lat_lon(lat, lon, sole.create.show_geocoded_name);
};

sole.create.show_geocoded_name = function() {
    var el = $('<span/>', {
        'text': ((sole.loc.geocoded)[2]).formatted_address
    });
    $('#create_enter_location').after(el);
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

sole.create.get_lat_lon_from_field = function() {
    var e_loc = $('#create_enter_location').val();
    if (e_loc === "") {
        return undefined;
    }
    var l_loc = e_loc.split(",");
    var lat = l_loc[0].replace(" ", ""), lon = l_loc[1].replace(" ", "");
    return [lat, lon];

};

// validate inputs and submit form to create a new sole
sole.create.submit = function(e) {
    console.log("sole.create.submit");
    if (!sole.create.validate()) {
        console.log("validation failed");
        return false;
    }

    // check whether the user is logged in
    sole.fb.login_status(sole.create.submit_logged_in, sole.create.login_error);
};

sole.create.login_error = function() {
    console.log("CREATE: NOT LOGGED IN");
};

sole.create.submit_logged_in = function() {
    var loc = sole.create.get_lat_lon_from_field();

    var params = {
        'day': $('#create_day').val(),
        'time':  $('#create_time').val(),
        'lat': loc[0],
        'lon': loc[1],
        'course_id': sole.sole.get_id(),
        'facebook_access_token': sole.fb.resp.authResponse.accessToken
    }

    $.ajax({
        url: '/sole',
        type: 'POST',
        data: params,
        success: sole.create.success,
        error: sole.create.error
    });
};

sole.create.success = function(d) {
    var j = $.parseJSON(d);
    var template = $('template#results_row').html();
    var r = sole.sole.format_result_for_template(j);

    sole.sole.add_result(template, r);
    sole.sole.remove_no_results();
    sole.load_deferred_images();
    sole.create.hide();
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

        var loc = sole.create.get_lat_lon_from_field();
        if (typeof(loc) === "undefined") {
            console.log("invalid lat lon");
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
    sole.sole.hide_results();
};

sole.create.hide = function() {
    $('#create').hide();
    $('#create_cancel').hide();
    $('#create_submit').hide();
    $('#create_start').show();
    $('#create_call_to_action').show();
    $('#create_form').each(function() { this.reset();} );
    sole.create.visible = false;

    // reset the form
    $('#create_day').select2('val', '');
    $('#create_time').select2('val', '');
    $('#create_enter_location').val('');
    $('#create_find_location').show();

    // show the results again
    sole.sole.show_results();
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
