var app = app || {};
app.views = app.views || {};

app.views.SoleListView = Backbone.View.extend({
    tagName: "div",

    events: {
        'click #create_start': 'createSole'
    },

    initialize: function() {
        _.bindAll(this);

        this.course_id = this.options.course_id;
        this.subviews = [];
    },
    
    createSole: function() {
        this.trigger("showCreateView");
    }, 

    render: function() {
        var r = $('script#results_template');
        this.$el.html(r.html())

        this.$('#results').empty();
        if (app.collections.soles.length > 0) {
            app.collections.soles.each(this.renderOne, this);
        } else {
            var t = $('script#no_results');
            this.$('#results').html(t.html()); 
        }
        return this;
    },

    renderOne: function(m) {
        var v = new app.views.SoleView({model: m});
        this.$('#results').append(v.render().el);
        this.subviews.push(v);
        var that = this;
        v.on("clearSole", function() { 
            that.trigger('rerenderSoleView'); 
        });
    },

    removeSubviews: function() {
        _.each(this.subviews, function(sv) {
            sv.off();
            sv.remove();
        });
        this.subviews = [];
    },
});
