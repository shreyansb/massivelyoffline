var app = app || {};
app.views = app.views || {};
app.collections = app.collections || {};

app.views.CreateView = Backbone.View.extend({
    tagName: 'div',

    events: {
        'click #create_cancel': 'cancel',
        'click #create_submit': 'submit',
        'click #create_find_address': 'findAddress'
    },

    initialize: function() {
        _.bindAll(this);
        this.course_id = this.options.course_id;
    },

    select2: function() {
        this.$el.find('#create_day').select2({
            width: '250px',
            allowClear: true,
            placeholder: "What day is best for you?",
            data: this.datesForDropdown(),
            initSelection: function() {}
        });
        this.$el.find('#create_day').select2("focus");
        this.$el.find('#create_time').select2({
            width: '250px',
            allowClear: true,
            placeholder: "Around what time?",
            data: this.timesForDropdown(),
            initSelection: function() {}
        });
    },
    
    cancel: function() {
        this.trigger("cancelCreate");
    }, 

    submit: function(e) {
        var errors = this.validate();
        if (errors.length == 0) {
            var that = this;
            app.models.user.getUser(that.loginSuccess, that.loginError);
        } else {
            // deal with errors
            console.log(errors);
            $('create_form_message').html(errors);
        }
    },

    loginSuccess: function() {
        this.create();
    },

    loginError: function() {
        console.log("CreateView:loginError");
    },

    create: function() {
        var params = {
            'day': $('#create_day').val(),
            'time':  $('#create_time').val(),
            'lat': this.loc[0],
            'lon': this.loc[1],
            'address': this.address,
            'course_id': this.course_id
        };
        var that = this;
        app.collections.soles.create(params, {success: that.triggerDone});
    },

    triggerDone: function(m) {
        this.trigger("doneCreate", m);
    },

    validate: function() {
        var errors = [];
        if (this.$('#create_day').val() === "")
            errors.push("day");
        if (this.$('#create_time').val() === "")
            errors.push("time");
        if (typeof(this.address) === "undefined")
            errors.push("address");
        if (typeof(this.loc) === "undefined")
            errors.push("location");
        return errors;
    },

    findAddress: function() {
        var a = $('#create_address').val();
        if (a === "") {
            this.geocodeError();
        } else {
            app.geo.geocodeAddress(a, this.geocodeSuccess, this.geocodeError);
        }
    },

    geocodeSuccess: function(data) {
        var a = data[0].formatted_address;
        var l = [data[0].geometry.location.lat, data[0].geometry.location.lng];
        this.loc = l;
        this.address = a;
        $('#create_address').val(a);
    },

    geocodeError: function(data) {
        console.log("CreateView:geocodeError ", data);
    },

    render: function() {
        var t = $('script#create_template');
        this.$el.html(t.html())
        this.select2();

        return this;
    },

    show: function() {
        this.$el.show();
    },

    hide: function() {
        this.$el.hide();
    },

    datesForDropdown: function() {
        var days = [];
        for (var i=0; i<14; i++) {
            var m = moment().add('days', i);
            days.push({
                'id': m.format('YYYY-MM-DD (ZZ)'), 
                'text': m.format('dddd, Do MMMM')
            });
        }
        return days;
    },

    timesForDropdown: function() {
        var t = [];
        _.each(app.data.possibleTimes, function(e, i, l) {
            t.push({
                'id': i,
                'text': e
            });
        });
        return t;
    },
});

