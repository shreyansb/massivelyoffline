var app = app || {};
app.views = app.views || {};

app.views.SoleListView = Backbone.View.extend({
    el: '#results_container',

    events: {
        'click #create_start': 'createSole'
    },

    initialize: function() {
        console.log("SoleListView:initialize", this.options.course_id);
        _.bindAll(this, "createSole", "noSoles", "render", "renderOne");

        this.course_id = this.options.course_id;
        this.$('#results').empty();

        // initialize the collection for this view
        app.collections.soles = new app.collections.SoleCollection([], {
            course_id: this.course_id
        });
        app.collections.soles.on("add", this.render());
        app.collections.soles.fetch({
            'success': this.render,
            'error': this.noSoles
        });
    },
    
    createSole: function() {
        console.log("SoleListView:createSole");
        this.trigger("showCreateView");
    }, 

    render: function() {
        console.log("SoleListView:render");
        this.$('#results').empty();
        if (app.collections.soles.length > 0) {
            app.collections.soles.each(this.renderOne, this);
        } else {
            // show the 'no result' template
            var t = $('script#no_results');
            this.$('#results').html(t.html()); 
        }

        this.show();
    },

    renderOne: function(m) {
        var v = new app.views.SoleView({model: m});
        this.$('#results').append(v.render().el);
    },

    noSoles: function() {
        console.log("SoleListView:noSoles");
    },

    show: function() {
        this.$el.show();
    },

    hide: function() {
        this.$el.hide();
    }
});
