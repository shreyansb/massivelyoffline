var app = app || {};
app.views = app.views || {};

app.views.SidebarView = Backbone.View.extend({
    el: '#sidebar',

    events: {
        'change #course_input': 'courseChange',
    },

    initialize: function() {
        console.log("SidebarView: initialize");
        _.bindAll(this, 'setupCourses', 'noCourses', 'courseChange', 'moveInputUp');

        this.$input = this.$('#course_input');

        // get the list of courses from the server and setup the input box when ready
        app.collections.courses.fetch({
            'success': this.setupCourses, 
            'error': this.noCourses
        });

        // deal with the position of the input bar
        this.bind('animateUp', this.moveInputUp);
        this.position = 'down';
        if (this.options.position == 'up') {
            console.log("SidebarView:initialize trying to animate up");
            this.trigger('animateUp');
        }

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
    },

    noCourses: function() {
        console.log("SidebarView: couldn't get courses for the dropdown");
    },

    courseChange: function(e) {
        console.log("SidebarView: courseChange");
        this.current = e.val;
        //console.log(app.collections.courses.asDict[this.current]);
        if (this.position == 'down') {
            console.log("SidebarView:courseChange trying to animate up");
            this.trigger('animateUp');
        }
    },

    moveInputUp: function() {
        console.log("SidebarView:moveInputUp");
        $('#course').find('h1').fadeOut(150);
        $('#course').find('h2').fadeOut(150);
        $('#sidebar').animate({ top: "10%" }, 200); 
        this.position = "up";
    }
});

