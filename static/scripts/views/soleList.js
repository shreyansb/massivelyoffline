var app = app || {};
app.views = app.views || {};

app.views.SoleListView = Backbone.View.extend({
    el: '#results',

    initialize: function() {
        console.log("SoleListView:initialize", this.options.course_id);
        _.bindAll(this, "createSole", "noSoles", "render", "renderOne");
        this.course_id = this.options.course_id;
        this.$el.empty();

        // initialize the collection for this view
        app.collections.soles = new app.collections.SoleCollection([], {
            course_id: this.course_id
        });
        app.collections.soles.fetch({
            'success': this.render,
            'error': this.noSoles
        });
    },
    
    createSole: function() {
        console.log("SoleListView:createSole");
    }, 

    render: function() {
        console.log("SoleListView:render");
        if (app.collections.soles.length > 0) {
            app.collections.soles.each(this.renderOne, this);
        } else {
            // show the 'no result' template
            var t = $('script#no_results');
            this.$el.html(t.html()); 
        }
        this.$el.show();
    },

    renderOne: function(m) {
        var v = new app.views.SoleView({model: m});
        this.$el.append(v.render().el);
    },

    noSoles: function() {
        console.log("SoleListView:noSoles");
    },
});
