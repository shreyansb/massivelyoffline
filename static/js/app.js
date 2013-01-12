var sole = sole || {};

sole.show_map = false;

sole.init = function() {
    if (sole.show_map) {
        sole.map.init();
    }
    sole.sole.get_courses();
    sole.setup_events();
    $('#course_input').on('change', sole.sole.submit);
    sole.create.setup_form();
    sole.load_deferred_images();
};

sole.load_deferred_images = function() {
    var imgs = $('img[data-src]');
    $.each(imgs, function(i, v) {
        var e = $(v);
        if ((e.attr('data-src')).indexOf("{{") == -1) {
            e.attr('src', e.attr('data-src'));  
        }
    });
};

sole.setup_events = function() {
    sole.create.events();
};

// Start the app
$(document).ready(sole.init);
