import L from 'leaflet';
import { template, getJSON } from '../util';

export default {
  class: L.Class.extend({
    options: {
      serviceUrl: 'http://api.geohistoricaldata.org/',
      geocodingQueryParams: {},
      reverseQueryParams: {}
    },

    initialize: function(options) {
      L.Util.setOptions(this, options);
    },

    geocode: function(query, cb, context) {
      var params = {
        address: query
      };
      params = L.Util.extend(params, this.options.geocodingQueryParams);
      getJSON(
        this.options.serviceUrl + 'geocoding',
        params,
        L.bind(function(data) {
          var results = [];
          for (var i = data.length - 1; i >= 0; i--) {
            var geog = data[i].geography.geometries[0].coordinates[0]
            var latLngBounds = L.latLngBounds(
              geog,
              geog
            )
            results[i] = {
              name: data[i].normalised_name,
              center: L.latLng(geog[1], geog[0]),
              bbox: latLngBounds,
              properties: data[i]
            };
          }
          cb.call(context, results);
        }, this)
      );
    },

    reverse: function(location, scale, cb, context) {
      getJSON(
        this.options.serviceUrl + 'reverse',
        L.extend(
          {
            lat: location.lat,
            lon: location.lng,
            zoom: Math.round(Math.log(scale / 256) / Math.log(2)),
            addressdetails: 1,
            format: 'json'
          },
          this.options.reverseQueryParams
        ),
        L.bind(function(data) {
          var result = [],
            loc;

          if (data && data.lat && data.lon) {
            loc = L.latLng(data.lat, data.lon);
            result.push({
              name: data.display_name,
              html: this.options.htmlTemplate ? this.options.htmlTemplate(data) : undefined,
              center: loc,
              bounds: L.latLngBounds(loc, loc),
              properties: data
            });
          }

          cb.call(context, result);
        }, this)
      );
    }
  }),

  factory: function(options) {
    return new L.Control.Geocoder.GeoHistoricalData(options);
  }
};
