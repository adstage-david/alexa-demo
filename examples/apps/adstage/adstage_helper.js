'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var ENDPOINT = 'https://platform.adstage.io';

function AdstageHelper() {
}

AdstageHelper.prototype.requestOverview = function(token) {
  var that = this;
  return this.getMe(token).then(
    function(user){
      var organization = user.body["_embedded"]["adstage:organizations"][0];
      console.log("logged into org " + organization.name);
      return that.getNetworkOverview(token, organization.id).then(
        function(response) {
          console.log('success - received info for rows count:', response.body["_embedded"]["adstage:metrics"].length);
          return response.body;
        }
      );
        
    }
  );
};

AdstageHelper.prototype.getMe = function(token) {
  var options = {
    method: 'GET',
    headers: {"Authorization": "Bearer "+token},
    uri: ENDPOINT + "/api/me?type=lightweight",
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

AdstageHelper.prototype.getNetworkOverview = function(token, org) {
  var options = {
    method: 'GET',
    qs: {"entity_level":"accounts","group_by":"network","sort_by":"network","date_range":"last 30 days"},
    headers: {"Authorization": "Bearer "+token},
    uri: ENDPOINT + org + "/build_report",
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};


AdstageHelper.prototype.formatMetricsResponse = function(level, metrics) {
  var range = "last 30 days";
  var network = _.template('Ads on ${network} spent ${currency_symbol}${spend} over ${range} and got ${clicks} clicks.');
  var results = metrics["_embedded"]["adstage:metrics"].map(function(row){
    var response = network({
      network: row.meta.network,
      currency_symbol: row.meta.currency_symbol,
      spend: _.round(row.data.spend),
      clicks: _.round(row.data.clicks),
      range: range
    });
    console.log(response);
    return response;
  });
    
  return results.join(" ");
};

module.exports = AdstageHelper;