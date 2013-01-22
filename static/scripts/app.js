var app = app || {};
app.views = app.views || {};
app.collections = app.collections || {};

var Workspace = Backbone.Router.extend({
    routes: {
        'course/:id': 'course',
        '*other': 'home'
    },
    initialize: function() {
        console.log("router: initialize");
        _.bindAll(this, "home", "course", "createSidebar");
        app.collections.courses = new app.collections.CourseCollection();
        app.views.map = new app.views.MapView();
        app.models.user = new app.models.User(app.data.user);
    },
    home: function() {
        console.log("router: home")
        this.createSidebar();
        this.navigate("/");
    },
    course: function(course_id) {
        console.log("router: course")
        this.createSidebar(course_id);
        this.navigate("course/" + course_id);
    },
    createSidebar: function(course_id) {
        if (typeof(course_id) === "undefined") {
            app.views.sidebar = new app.views.SidebarView();
        } else {
            app.views.sidebar = new app.views.SidebarView({course_id: course_id});
        }
        app.views.sidebar.on("updateMarkers", function() {
            console.log("Workspace:createSidebar:updateMarkers");
            app.views.map.trigger("updateMarkers");
        });
    }
});

app.router = new Workspace();

Backbone.history.start();

