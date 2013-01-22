var app = app || {};
app.models = app.models || {};
app.collections = app.collections || {};

app.models.Sole = Backbone.Model.extend({
});

app.collections.SoleCollection = Backbone.Collection.extend({
    model: app.models.Sole,
    url: function() {
        return '/course/' + this.course_id + '/sole';
    },
    initialize: function(models, options) {
        _.bindAll(this, "url");
        if (!options.course_id) {
            console.log("SoleCollection:initialize course_id missing");
        }
        this.course_id = options.course_id;
    },
});
