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

sole.loc.data_for_lat_lon = function(lat, lon, callback) {
    var url = "http://maps.googleapis.com/maps/api/geocode/json?"+"latlng="+lat+","+lon+"&sensor=true";
    $.get(url, function(d) { 
        sole.loc.geocoded = d.results;
        callback();
        return false;
    });
}
