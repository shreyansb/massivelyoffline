var app = app || {};
app.views = app.views || {};

app.views.SidebarView = Backbone.View.extend({
    el: '#sidebar',

    events: {
        'change #course_input': 'changeCourse',
    },

    initialize: function() {
        console.log("SidebarView:initialize");
        _.bindAll(this, 'setupCourses', 'noCourses', 'changeCourse', 'moveInputUp', 
            'destroyCreateView', 'destroySoleListView', 'createCreateView', 'createSoleListView',
            'swapToCreateView', 'swapToSoleListView');
        this.bind('animateUp', this.moveInputUp);
        this.bind('changeCourse', this.changeCourse);

        this.$input = this.$('#course_input');

        app.collections.courses.fetch({
            'success': this.setupCourses, 
            'error': this.noCourses
        });
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
        console.log("SidebarView:destroyCreateView");
        app.views.create.off();
        app.views.create.remove();
        app.views.create = undefined;
    },

    destroySoleListView: function() {
        console.log("SidebarView:destroyCreateView");
        app.views.solelist.off();
        app.views.solelist.removeSubviews();
        app.views.solelist.remove();
        app.views.solelist = undefined;
    },

    createSoleListView: function() {
        console.log("SidebarView:createSoleListView");
        app.views.solelist = new app.views.SoleListView({course_id: this.course_id});
        app.views.solelist.on('showCreateView', this.swapToCreateView);
        $('#results_container').append(app.views.solelist.render().el);
        app.router.navigate("course/" + this.course_id);
        app.views.map.dfd.done(app.views.map.resetAndAddCollectionMarkers);
    },

    createCreateView: function() {
        console.log("SidebarView:createCreateView");
        app.views.create = new app.views.CreateView({course_id: this.course_id});
        app.views.create.on('cancelCreate', this.swapToSoleListView);
        app.views.create.on('doneCreate', this.swapToSoleListView);
        $('#create_container').append(app.views.create.render().el);
    },

    swapToCreateView: function() {
        console.log("SidebarView:swapToCreateView");
        this.destroySoleListView();
        this.createCreateView();
    },

    swapToSoleListView: function() {
        console.log("SidebarView:swapToSoleListView");
        this.destroyCreateView();
        this.createSoleListView();
    },

    moveInputUp: function() {
        $('#course').find('h1').fadeOut(150);
        $('#course').find('h2').fadeOut(150);
        $('#sidebar').animate({ top: "10%" }, 200); 
        this.position = "up";
    }
});

