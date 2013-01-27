var app = app || {};
app.views = app.views || {};

app.views.SidebarView = Backbone.View.extend({
    el: '#sidebar',

    events: {
        'change #course_input': 'changeCourse',
    },

    initialize: function() {
        _.bindAll(this);
        this.bind('animateUp', this.moveInputUp);
        this.bind('changeCourse', this.changeCourse);

        this.$input = this.$('#course_input');

        app.collections.courses.fetch({
            'success': this.setupCourses, 
            'error': this.noCourses
        });
    },

    setupCourses: function() {
        this.$input.select2({
            width: "600px",
            placeholder: "What class are you taking?",
            data: app.collections.courses.toJSON(),
            initSelection: function(element, callback) {
                var course_id = element.val();
                var course = app.collections.courses.asDict[course_id];
                if (course) {
                    callback({'id': course_id, 'text': course['text']});
                }
            }
        });
        this.$input.select2("focus");
        app.collections.courses.toDict();

        this.position = 'down';
        if (this.options.course_id) {
            this.course_id = this.options.course_id;
            this.$input.select2("val", this.course_id);
            this.trigger('changeCourse', this.course_id);
        }
    },

    noCourses: function(e) {
        console.log("SidebarView:noCourses error!");
        console.log(e);
    },

    changeCourse: function(e) {
        if (this.position == 'down') {
            this.trigger('animateUp');
        }

        if (typeof(e) == "object") {
            this.course_id = e.val;
        } else if (typeof(e) == "string") {
            this.course_id = e;
        }

        if (app.views.create) {
            this.destroyCreateView();
        }
        if (app.views.solelist) {
            this.destroySoleListView();
        }

        // initialize the collection for this view
        app.collections.soles = new app.collections.SoleCollection([], {
            course_id: this.course_id
        });
        app.collections.soles.fetch({
            'success': this.createSoleListView,
            'error': this.createSoleListView
        });
    },
    
    destroyCreateView: function() {
        app.views.create.off();
        app.views.create.remove();
        app.views.create = undefined;
    },

    destroySoleListView: function() {
        app.views.solelist.off();
        app.views.solelist.removeSubviews();
        app.views.solelist.remove();
        app.views.solelist = undefined;
    },

    createSoleListView: function(m) {
        app.views.solelist = new app.views.SoleListView({
            course_id: this.course_id
        });
        app.views.solelist.on('showCreateView', this.swapToCreateView);
        app.views.solelist.on('rerenderSoleView', this.rerenderSoleView);
        $('#results_container').append(app.views.solelist.render().el);
        app.router.navigate("course/" + this.course_id);
        this.trigger("updateMarkers");
        if (m instanceof Backbone.Model) {
            this.trigger("centerMap", m);
        }
    },

    rerenderSoleView: function() {
        this.destroySoleListView();
        this.createSoleListView();
    },

    createCreateView: function() {
        app.views.create = new app.views.CreateView({course_id: this.course_id});
        app.views.create.on('cancelCreate', this.swapToSoleListView);
        app.views.create.on('doneCreate', this.swapToSoleListView);
        $('#create_container').append(app.views.create.render().el);
    },

    swapToCreateView: function() {
        this.destroySoleListView();
        this.createCreateView();
    },

    swapToSoleListView: function(m) {
        this.destroyCreateView();
        this.createSoleListView(m);
    },

    moveInputUp: function() {
        $('#course').find('h2').fadeOut(150);
        $('#sidebar').animate({ top: "20" }, 200); 
        this.position = "up";
    }
});

