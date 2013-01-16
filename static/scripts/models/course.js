var app = app || {};
app.models = app.models || {};
app.collections = app.collections || {};

app.models.Course = Backbone.Model.extend({});

app.collections.CourseCollection = Backbone.Collection.extend({
    model: app.models.Course,
    url: '/course',
    toDict: function() {
        this.asDict = app.utils.format_courses_as_dict(this.toJSON());
    }
});
