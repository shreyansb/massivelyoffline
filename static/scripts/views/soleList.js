var app = app || {};
app.views = app.views || {};

app.views.SoleListView = Backbone.View.extend({
    el: '#results',
    events: {
        'click #create_button': create
    },
    initialize: function() {
        console.log("SoleListView:initialize");
        _.bindAll(this, "create", "loadSoles");
        this.create = this.$('create_button');
        this.course_id = this.options.course_id;
        console.log("SoleListView:initialize", this.course_id);
        this.$el.show();
    },
    
    create: function() {
        console.log("SoleListView:create");
    }, 

    loadSoles: function() {
        console.log("SoleListView:loadSoles");
    }
});
