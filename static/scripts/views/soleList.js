var app = app || {};
app.views = app.views || {};

app.views.SoleListView = Backbone.View.extend({
    tagName: "div",

    events: {
        'click #create_start': 'createSole'
    },

    initialize: function() {
        console.log("SoleListView:initialize", this.options.course_id);
        _.bindAll(this, "createSole", "render", "renderOne", "show", "hide", "removeSubviews");

        this.course_id = this.options.course_id;
        this.$('#results').empty();
    },
    
    createSole: function() {
        console.log("SoleListView:createSole");
        this.trigger("showCreateView");
    }, 

    render: function() {
        console.log("SoleListView:render");

        var r = $('script#results_template');
        this.$el.html(r.html())

        this.$el.find('#results').empty();
        if (app.collections.soles.length > 0) {
            app.collections.soles.each(this.renderOne, this);
        } else {
            // show the 'no result' template
            var t = $('script#no_results');
            this.$el.find('#results').html(t.html()); 
        }

        return this;
    },

    renderOne: function(m) {
        var v = new app.views.SoleView({model: m});
        this.$('#results').append(v.render().el);
    },

    show: function() {
        this.$el.show();
    },

    hide: function() {
        this.$el.hide();
    },

    removeSubviews: function() {
        console.log("SoleListView:removeSubviews");
    },
});
