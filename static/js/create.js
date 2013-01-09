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
