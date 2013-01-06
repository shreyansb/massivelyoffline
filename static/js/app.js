var sole = sole || {};

sole.course = sole.course || {};
sole.create = sole.create || {};
sole.cls = sole.cls || {};

sole.cls.moved = false;
sole.create.visible = false;
sole.course.list = [];

sole.init = function() {
    sole.map.init();
    sole.course.get_courses();
    sole.setup_events();
    $('#cls_input').focus();
    $('#cls_input').on('change', sole.cls.submit);
};

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

sole.cls.submit = function(event) {
    sole.map.reset_markers();

    // if this is the first submit, we move the elements around
    if (sole.cls.moved === false) {
        $('#cls').find('h1').fadeOut(150);
        $('#cls').find('h2').fadeOut(150);
        $('#sidebar').animate({ top: "10%" }, 200); 
        setTimeout(function() {
            $('#results').fadeIn(150);
        }, 150);
        sole.cls.moved = true;
    }

    // on every submit, get new results

    var class_id = sole.cls.get_class_id();
    $.get('/sole/' + class_id, function(data) {
        var results = $.parseJSON(data);
        for (var i=0; i<results.length; i++) {
            var r = results[i];
            sole.map.add_marker(r.loc[0], r.loc[1], "result", i, false);
            //sole.results.add(r);
        }
    });
    return false;
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

/*
// Show the form to create a new activity
// Pre-fill the form if possible
sole.create.show = function(class_id) {
    sole.create.visible = true;
    sole.create.id = class_id;
    $('#create').show();
    var c = sole.course.dict[class_id];
    $('#class_name').text(c.name);
    $('#prof_name').text(c.prof);
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
