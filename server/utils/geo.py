import pygeoip
import os

geoip_path = os.path.join(os.environ.get('APP_HOME'), 'data/GeoLiteCity.dat')
geo = pygeoip.GeoIP(geoip_path)

def loc_from_ip(ip):
    if ip == "127.0.0.1":
        ip = "108.27.114.30" # New York, NY
        ip = "208.76.220.220" # Philadelphia, PA
    return geo.record_by_addr(ip)
