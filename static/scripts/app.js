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
        app.collections.courses = new app.collections.CourseCollection();
        app.views.map = new app.views.MapView();
    },
    home: function() {
        console.log("router: home")
        app.views.sidebar = new app.views.SidebarView();
        this.navigate("/");
    },
    course: function(id) {
        console.log("router: course")
        app.views.sidebar = new app.views.SidebarView({course_id: id});
        this.navigate("course/" + id);
    }
});

app.router = new Workspace();

Backbone.history.start();

