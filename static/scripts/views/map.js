var app = app || {};
app.views = app.views || {};

app.views.MapView = Backbone.View.extend({
    events: {},

    initialize: function() {
        _.bindAll(this);
        this.dfd = new $.Deferred();  // to be used with mapbox.load
        this.map = undefined;
        this.markers = undefined;
        this.defaultLat = app.data.loc.latitude;
        this.defaultLon = app.data.loc.longitude;
        this.baseMapId = 'shreyansb.map-d6wn3q7b';
        this.streetsMapId = 'shreyansb.map-1btgpwx1';
        this.load();
        this.on("updateMarkers", function() {
            this.dfd.done(this.resetAndAddCollectionMarkers);
        });
        this.on("centerMap", function(m) {
            var that = this;
            this.dfd.done(function() {
                that.centerAndPan(m);
            });
        });
    },

    load: function() {
        var that = this;
        mapbox.load(that.baseMapId, function(o) {
            var map = mapbox.map('map');
            map.centerzoom({lat: that.defaultLat, lon: that.defaultLon}, 12);
            map.addLayer(o.layer);
            map.panBy(-1*(window.innerWidth/4), 0)
            that.map = map;
            that.dfd.resolve("map");
        });
        
        this.dfd.done(this.resetAndAddCollectionMarkers);
    },

    resetAndAddCollectionMarkers: function() {
        this.reset();
        this.setupMarkerLayer();
        this.addCollectionMarkers();
        this.dfd.resolve("resetAndAddCollectionMarkers");
    },

    setupMarkerLayer: function() {
        var markerLayer = mapbox.markers.layer();
        this.map.addLayer(markerLayer);
        this.markers = markerLayer;
        var interaction = mapbox.markers.interaction(markerLayer);
        interaction.showOnHover(true);
        this.interaction = interaction;
    },

    addCollectionMarkers: function() {
        // add all the soles in the current collection to the map
        if (app.collections.soles) {
            var that = this;
            _.each(app.collections.soles.toJSON(), function(s) {
                var title = that.getMarkerTitle(s);
                var description = that.getMarkerDescription(s);
                that.addMarker(s.lat, s.lon, title, description, false);
            });
        }
    },

    getMarkerTitle: function(s) {
        var c = app.collections.courses.get(s.course_id);

        var i = $("<img/>", {
            src: c.get('uni_img'),
            "class": 'marker_title_uni_image'
        });

        var t = c.get('name') + " with " + s.num_students;
        if (s.num_students == 1) {
            t = t + " other";
        } else {
            t = t + " others";
        }
        
        var el = $("<div/>").append(i).append(t);
        return el.html();
    },

    getMarkerDescription: function(s) {
        var day = app.utils.formatDate(s.day);
        var desc = day + ", " + app.utils.formatTime(s.time);
        var d_el = $("<span/>", {
            "text": desc,
            "class": 'marker_description'
        });
        var el = $("<div/>").append(d_el);
        return el.html();
    },

    addMarker: function(lat, lon, title, description) {
        this.markers.add_feature({
            'geometry': {
                'coordinates': [lon, lat]
            },
            'properties': {
                'marker-color': '#000',
                'marker-symbol': 'star-stroked',
                'title': title,
                'description': description
            }
        });
    },

    reset: function() {
        if (typeof(this.markers) != "undefined") {
            this.map.removeLayer(this.markers.name);
            this.markers = undefined;
        }
    },

    centerAndPan: function(m) {
        if (m && m.get('lat') && m.get('lon')) {
            this.map.center({
                lat: m.get('lat'),
                lon: m.get('lon')
            });
            this.map.panBy(-1*(window.innerWidth/4), 0)
        }
        this.dfd.resolve("centerAndPan");
    }
});
