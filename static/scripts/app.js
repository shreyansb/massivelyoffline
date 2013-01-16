var app = app || {};

var Workspace = Backbone.Router.extend({
    routes: {
        'course/:id': 'course',
        '*other': 'home'
    },
    home: function() {
        console.log("router: home")
        new app.views.SidebarView();
        this.navigate("/");
    },
    course: function(id) {
        console.log("router: course")
        this.navigate("course/" + id);
    }
});

app.router = new Workspace();

Backbone.history.start();

