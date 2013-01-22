var app = app || {};
app.geo = app.geo || {};

app.geo.geocodeLatLon = function(lat, lon, success_callback, error_callback) {
    var params = {
        'latlng': lat+","+lon,
    };
    return app.geo.geocode(params, success_callback, error_callback);
}

app.geo.geocodeAddress = function(address, success_callback, error_callback) {
    var params = {
        'address': address
    };
    return app.geo.geocode(params, success_callback, error_callback);
};

app.geo.geocode = function(params, success_callback, error_callback) {
    var url = "https://maps.googleapis.com/maps/api/geocode/json";
    params['sensor'] = true;
    $.get(url, params, function(data) {
        if (data.status === "OK") {
            if (success_callback) {
                success_callback(data.results);
            } else {
                console.log(data);
            }
        } else {
            if (error_callback) {
                error_callback(data); 
            } else {
                console.log("error: ", data);
            }
        }
    }, 'json');
}
