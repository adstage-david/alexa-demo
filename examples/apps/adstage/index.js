'use strict';
module.change_code = 3;
var _ = require('lodash');
var Alexa = require('alexa-app');
var AdstageHelper = require('./adstage_helper');

// Declares an alexa app - visit:
// /adstage?schema  and /adstage?utterances to get configuration info
// /adstage  to get debugging interface
var app = new Alexa.app('adstage');

app.launch(function(req, res) {
  var prompt = 'You can request for an overview by network or ask to link to adstage';
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('LinkAdstage', {
  'slots': {},
  'utterances': ['{link|connect|log in}{| to} AdStage']
},
  function(req, res) {
    res.linkAccount();
    console.log("Linking request");
    res.say("Check the Alexa app to log into adstage.");
  }
);

app.intent('Overview', {
  'slots': {},
  'utterances': ['{|tell |give }{|a|an} {|advertising|ads|campaign} overview']
},
  function(req, res) {
    var adstage = new AdstageHelper();
    var token = req.sessionDetails.accessToken;
    console.log(req.sessionDetails);  
    
    adstage.requestOverview(token).then(function(data) {
      console.log("Total spend:", data["_embedded"]["adstage:metrics/totals"]["data"]["spend"]);
      var response = adstage.formatMetricsResponse("network", data);
      res.say(response).card({"type": "Standard", "title": "Adstage Overview", "text": response}).send();
    }).catch(function(err) {
      console.log(err);
      var prompt = 'There was a problem getting data from adstage.';
      res.say(prompt).shouldEndSession(true).send();
    });
    return false;
  }
);

//hack to support custom utterances in utterance expansion string
console.log(app.utterances().replace(/\{\-\|/g, '{'));
module.exports = app;