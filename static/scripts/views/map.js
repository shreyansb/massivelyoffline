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
            console.log("MapView:centerMap", m);
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
                that.addMarker(s.lat, s.lon, app.utils.format_date(s.day), s.address, false);
            });
        }
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
