var app = app || {};
app.views = app.views || {};
app.collections = app.collections || {};

var Workspace = Backbone.Router.extend({
    routes: {
        'course/:id': 'course',
        '*other': 'home'
    },
    initialize: function() {
        _.bindAll(this);
        app.collections.courses = new app.collections.CourseCollection();
        app.views.map = new app.views.MapView();
        app.models.user = new app.models.User(app.data.user);
    },
    home: function() {
        this.createSidebar();
        this.navigate("/");
    },
    course: function(course_id) {
        this.createSidebar(course_id);
        this.navigate("course/" + course_id);
    },
    createSidebar: function(course_id) {
        if (typeof(course_id) === "undefined") {
            app.views.sidebar = new app.views.SidebarView();
        } else {
            app.views.sidebar = new app.views.SidebarView({course_id: course_id});
        }
        // if anything in the sidebar requires markers to be updated, it happens
        // via this event, passed up to the workspace
        // unsure of this method vs. directly calling a 'public' method on 
        // the map
        app.views.sidebar.on("updateMarkers", function() {
            app.views.map.trigger("updateMarkers");
        });
    }
});

app.router = new Workspace();

Backbone.history.start();

