var app = app || {};
app.models = app.models || {};
app.collections = app.collections || {};

app.models.Sole = Backbone.Model.extend({
        /*
    defaults: {
        "id" : "",
        "user_id" : "",
        "course_id" : "",
        "student_ids" : [],
        "num_students" : 1,
        "address" : "",
        "lat" : "",
        "lon" : "",
        "time" : "",
        "day" : ""
    }
    */
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
