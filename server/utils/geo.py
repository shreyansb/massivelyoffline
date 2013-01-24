import pygeoip

geo = pygeoip.GeoIP('data/GeoLiteCity.dat')

def loc_from_ip(ip):
    if ip == "127.0.0.1":
        ip = "108.27.114.30"
    return geo.record_by_addr(ip)
