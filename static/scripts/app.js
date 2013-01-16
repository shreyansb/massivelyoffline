var app = app || {};
app.views = app.views || {};
app.collections = app.collections || {};

var Workspace = Backbone.Router.extend({
    routes: {
        'course/:id': 'course',
        '*other': 'home'
    },
    home: function() {
        console.log("router: home")
        this.navigate("/");
    },
    course: function(id) {
        console.log("router: course")
        this.navigate("course/" + id);
        app.views.sidebar = new app.views.SidebarView({position: 'up', id: id});
    },
    initialize: function() {
        console.log("router: initialize");
        app.collections.courses = new app.collections.CourseCollection();
        app.views.sidebar = new app.views.SidebarView({position: 'down'});
    }
});

app.router = new Workspace();

Backbone.history.start();

