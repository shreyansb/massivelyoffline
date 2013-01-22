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
        console.log("CreateView:initialize", this.options.course_id);
        _.bindAll(this, "cancel", "submit", "render", "validate", "findAddress",
            "geocodeSuccess", "geocodeError", "show", "hide", "datesForDropdown",
            "timesForDropdown", "select2", "loginSuccess", "loginError", "create",
            "triggerDone");

        this.course_id = this.options.course_id;
    },

    select2: function() {
        console.log("CreateView:select2");
        this.$el.find('#create_day').select2({
            width: '250px',
            allowClear: true,
            placeholder: "What day are you available?",
            data: this.datesForDropdown(),
            initSelection: function() {}
        });
        this.$el.find('#create_time').select2({
            width: '150px',
            allowClear: true,
            placeholder: "At what time?",
            data: this.timesForDropdown(),
            initSelection: function() {}
        });
    },
    
    cancel: function() {
        console.log("CreateView:cancel");
        this.trigger("cancelCreate");
    }, 

    submit: function(e) {
        console.log("CreateView:submit");
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
        console.log("CreateView:loginSuccess");
        this.create();
    },

    loginError: function() {
        console.log("CreateView:loginError");
    },

    create: function() {
        console.log("CreateView:create");
        var params = {
            'day': $('#create_day').val(),
            'time':  $('#create_time').val(),
            'lat': this.loc[0],
            'lon': this.loc[1],
            'address': this.address,
            'course_id': this.course_id,
            'facebook_access_token': app.fb.resp.authResponse.accessToken
        };
        var that = this;
        app.collections.soles.create(params, {success: that.triggerDone});
    },

    triggerDone: function() {
        console.log("CreateView:triggerDone");
        this.trigger("doneCreate");
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
        console.log("CreateView:findAddress");
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
        console.log("SoleListView:render");

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
            days.push({'id':m.format(), 'text': m.format('dddd, Do MMMM')});
        }
        return days;
    },

    timesForDropdown: function() {
        return [
            {'id': '6 am', 'text': 'at 6 am'},
            {'id': '6:30 am', 'text': 'at 6:30 am'},
            {'id': '7 am', 'text': 'at 7 am'},
            {'id': '7:30 am', 'text': 'at 7:30 am'},
            {'id': '8 am', 'text': 'at 8 am'},
            {'id': '8:30 am', 'text': 'at 8:30 am'},
            {'id': '9 am', 'text': 'at 9 am'},
            {'id': '9:30 am', 'text': 'at 9:30 am'},
            {'id': '10 am', 'text': 'at 10 am'},
            {'id': '10:30 am', 'text': 'at 10:30 am'},
            {'id': '11 am', 'text': 'at 11 am'},
            {'id': '11:30 am', 'text': 'at 11:30 am'},
            {'id': '12 pm', 'text': 'at 12 pm'},
            {'id': '12:30 pm', 'text': 'at 12:30 pm'},
            {'id': '1 pm', 'text': 'at 1 pm'},
            {'id': '1:30 pm', 'text': 'at 1:30 pm'},
            {'id': '2 pm', 'text': 'at 2 pm'},
            {'id': '2:30 pm', 'text': 'at 2:30 pm'},
            {'id': '3 pm', 'text': 'at 3 pm'},
            {'id': '3:30 pm', 'text': 'at 3:30 pm'},
            {'id': '4 pm', 'text': 'at 4 pm'},
            {'id': '4:30 pm', 'text': 'at 4:30 pm'},
            {'id': '5 pm', 'text': 'at 5 pm'},
            {'id': '5:30 pm', 'text': 'at 5:30 pm'},
            {'id': '6 pm', 'text': 'at 6 pm'},
            {'id': '6:30 pm', 'text': 'at 6:30 pm'},
            {'id': '7 pm', 'text': 'at 7 pm'},
            {'id': '7:30 pm', 'text': 'at 7:30 pm'},
            {'id': '8 pm', 'text': 'at 8 pm'},
            {'id': '8:30 pm', 'text': 'at 8:30 pm'},
            {'id': '9 pm', 'text': 'at 9 pm'},
            {'id': '9:30 pm', 'text': 'at 9:30 pm'},
            {'id': '10 pm', 'text': 'at 10 pm'},
            {'id': '10:30 pm', 'text': 'at 10:30 pm'},
            {'id': '11 pm', 'text': 'at 11 pm'},
            {'id': '11:30 pm', 'text': 'at 11:30 pm'}
        ];
    },
});

