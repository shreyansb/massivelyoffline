var app = app || {};
app.models = app.models || {};
app.collections = app.collections || {};

app.models.Sole = Backbone.Model.extend({
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
    },
    initialize: function() {
        this.on('change:student_ids', function() {
            console.log('Sole: change triggered');
        });
    },
    validate: function(attr) {
        if (attr.num_students < 0) {
            console.log("num_students < 0, how did this happen?");
        }
    }
});

app.collections.SoleCollection = Backbone.Collection.extend({
    model: app.models.Sole,
    initialize: function() {
        this.on("add", function() {
            console.log("SoleCollection: add triggered");
        });
    },
});
