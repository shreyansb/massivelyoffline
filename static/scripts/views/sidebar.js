var app = app || {};
app.views = app.views || {};

app.views.SidebarView = Backbone.View.extend({
    el: '#sidebar',

    events: {
        'change #course_input': 'changeCourse',
    },

    initialize: function() {
        console.log("SidebarView:initialize");
        _.bindAll(this, 'setupCourses', 'noCourses', 
            'changeCourse', 'moveInputUp', 'showCreateView',
            'showSoleListView');
        this.bind('animateUp', this.moveInputUp);
        this.bind('changeCourse', this.changeCourse);

        this.$input = this.$('#course_input');

        app.collections.courses.fetch({
            'success': this.setupCourses, 
            'error': this.noCourses
        });
    },

    showCreateView: function() {
        console.log("SidebarView:showCreateView");
        app.views.create = new app.views.CreateView({course_id: this.course_id});
        app.views.create.on('cancelCreate', this.showSoleListView);
        app.views.create.on('doneCreate', this.showSoleListView);
        this.hideSoleListView();
        app.views.create.show();
    },

    hideCreateView: function() {
        app.views.create.hide();
        app.views.create.off();
        app.views.create = undefined;
    },

    showSoleListView: function() {
        console.log("SidebarView:showSoleListView");
        if (!app.views.solelist)
            app.views.solelist = new app.views.SoleListView({course_id: this.course_id});
        app.views.solelist.on('showCreateView', this.showCreateView);
        this.hideCreateView();
        app.views.solelist.render();
        app.views.solelist.show();
    },

    hideSoleListView: function() {
        app.views.solelist.hide();
        app.views.solelist.off();
    },

    setupCourses: function() {
        console.log("SidebarView:setupCourses");
        this.$input.select2({
            width: "600px",
            placeholder: "What class are you taking?",
            data: app.collections.courses.toJSON(),
            initSelection: function() {}
        });
        this.$input.select2("focus");
        app.collections.courses.toDict();

        this.position = 'down';
        if (this.options.course_id) {
            this.course_id = this.options.course_id;
            console.log("SidebarView:setupCourses changing to", this.course_id);
            this.$input.select2("val", this.course_id);
            this.trigger('changeCourse', this.course_id);
        }
    },

    noCourses: function(e) {
        console.log("SidebarView:noCourses error!");
        console.log(e);
    },

    changeCourse: function(e) {
        console.log("SidebarView:changeCourse");
        if (this.position == 'down') {
            this.trigger('animateUp');
        }

        if (typeof(e) == "object") {
            this.course_id = e.val;
        } else if (typeof(e) == "string") {
            this.course_id = e;
        }

        if (app.views.create) {
            this.hideCreateView();
        }
        app.views.solelist = new app.views.SoleListView({course_id: this.course_id});
        app.views.solelist.on('showCreateView', this.showCreateView);
        app.router.navigate("course/" + this.course_id);
    },

    moveInputUp: function() {
        $('#course').find('h1').fadeOut(150);
        $('#course').find('h2').fadeOut(150);
        $('#sidebar').animate({ top: "10%" }, 200); 
        this.position = "up";
    }
});

