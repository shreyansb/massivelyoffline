var app = app || {};
app.utils = app.utils || {};

// converts a list as expected by select2, so to a dictionary that
// allows for course lookup by id
app.utils.format_courses_as_dict = function(c) {
    var dict = {};
    for (var i=0; i < c.length; i++) {
        var o = c[i];
        dict[o['id']] = o;
    }
    return dict;
};
