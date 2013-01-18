var app = app || {};
app.views = app.views || {};

app.views.MapView = Backbone.View.extend({
    events: {},

    initialize: function() {
        _.bindAll(this, "load", "setupMarkerLayer", "reset",
            "addCollectionMarkers", "addMarker");
        this.map = undefined;
        this.markers = undefined;
        this.defaultLat = window.sole_ip_loc.latitude;
        this.defaultLon = window.sole_ip_loc.longitude;
        this.baseMapId = 'shreyansb.map-d6wn3q7b';
        this.streetsMapId = 'shreyansb.map-1btgpwx1';
        this.load();
    },

    load: function() {
        var that = this;
        mapbox.load(that.baseMapId, function(o) {
            var map = mapbox.map('map');
            map.centerzoom({lat: that.defaultLat, lon: that.defaultLon}, 12);
            map.addLayer(o.layer);
            map.panBy(-1*(window.innerWidth/4), 0)
            that.map = map;
            that.setupMarkerLayer();
        });
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
        this.reset();
        this.setupMarkerLayer();
        // add all the soles in the current collection to the map
        if (app.collections.soles) {
            var that = this;
            _.each(app.collections.soles.toJSON(), function(s) {
                that.addMarker(s.lat, s.lon, app.utils.format_date(s.day), s.address, false);
            });
        }
    },

    addMarker: function(lat, lon, title, description, center) {
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

        if (center) {
            this.map.center({ lat: lat, lon: lon });
        }
    },

    reset: function() {
        if (typeof(this.markers) != "undefined") {
            this.map.removeLayer(this.markers.name);
            this.markers = undefined;
        }
    }
});
