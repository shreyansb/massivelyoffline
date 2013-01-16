var app = app || {};
app.views = app.views || {};
app.data = app.data || {};

app.views.SidebarView = Backbone.View.extend({
    el: '#sidebar',
    initialize: function() {
        $.get('http://127.0.0.1:5000/course', function(data) {
            app.data.course_list = $.parseJSON(data);
            $('#course_input').select2({
                width: "600px",
                placeholder: "What class are you taking?",
                data: app.data.course_list
            });
            $('#course_input').select2("focus");
            app.data.course_dict = app.utils.format_courses_as_dict(app.data.course_list);
        });
    }
});

