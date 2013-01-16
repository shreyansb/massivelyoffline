var app = app || {};
app.views = app.views || {};

app.views.SidebarView = Backbone.View.extend({
    el: '#sidebar',
    events: {
        'change #course_input': 'courseChange'
    },
    initialize: function() {
        console.log("SidebarView: initialize");
        _.bindAll(this, 'setupCourses', 'noCourses', 'courseChange');
        this.$input = this.$('#course_input');
        app.collections.courses.fetch({'success': this.setupCourses, 'error': this.noCourses});
        return this;
    },
    setupCourses: function() {
        console.log("SidebarView: setupCourses");
        this.$input.select2({
            width: "600px",
            placeholder: "What class are you taking?",
            data: app.collections.courses.toJSON()
        });
        this.$input.select2("focus");
        app.collections.courses.toDict();

        if (this.options.position == 'down') {
            console.log("SidebarView:initialize position down");
        } else {
            console.log("SidebarView:initialize position up");
        }
    },
    noCourses: function() {
        console.log("SidebarView: couldn't get courses for the dropdown");
    },
    courseChange: function(e) {
        console.log("SidebarView: courseChange");
        this.current = e.val;
        console.log(app.collections.courses.asDict[this.current]);
        this.options.position = "up";
    }
});

