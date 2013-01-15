sole.loc = sole.loc || {};
sole.loc.current = undefined;
sole.loc.denied = undefined;
sole.loc.geocoded = undefined;

sole.loc.request = function(e) {
    console.log("sole.loc.request");
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            sole.loc.request_success, sole.loc.request_failure);
        setTimeout(sole.loc.request_ignored, 5000);
    }
    return false;
};

sole.loc.request_success = function(l) {
    var lat = l.coords.latitude,
        lon = l.coords.longitude;
    sole.loc.current = [lat, lon];
    sole.loc.denied = false;
    sole.create.update_ui_with_loc(lat, lon);
};

sole.loc.request_failure = function() {
    sole.loc.denied = true;
};

sole.loc.request_failure = function() {
    if (typeof(sole.loc.denied === "undefined")) {
        sole.loc.denied = true;
    };
};

sole.loc.find_entered_location = function() {
    var i = $('#create_enter_location').val();
    if (i === "") return false;
};

sole.loc.geocode_lat_lon = function(lat, lon, success_callback, error_callback) {
    var params = {
        'latlng': lat+","+lon,
    };
    return sole.loc.geocode(params, success_callback, error_callback);
}

sole.loc.geocode_address = function(address, success_callback, error_callback) {
    var params = {
        'address': address
    };
    return sole.loc.geocode(params, success_callback, error_callback);
};

sole.loc.geocode = function(params, success_callback, error_callback) {
    var url = "https://maps.googleapis.com/maps/api/geocode/json";
    params['sensor'] = true;
    console.log(url);
    console.log(params);
    $.get(url, params, function(data) {
        if (data.status === "OK") {
            if (success_callback) {
                var r = data.results;
                sole.loc.geocoded = r;
                success_callback(r);
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
        var r = data.results;
    }, 'json');
}
