"use strict";

var util = require('util');
var https = require('https');
var SSL_LABS_API_V2 = "/api/v2";
var intervalObj = undefined;
var events = require('events');
var ANALYZE_POLL_INTERVAL = 30000;
var debug = true;

function debugLog(log){
  if (debug === true){
    console.log(log);
  }
}


// Instantiate if one not already created/new'ed
function SslLabsApi(hostToAnalyze){
  if (!(this instanceof SslLabsApi)){
    return new SslLabsApi(hostToAnalyze);
  }

  this.options = {
    host: 'api.ssllabs.com',
    method: 'GET',
    path: '/'
  }

  events.EventEmitter.call(this);
  this.hostToAnalyze = hostToAnalyze;
}


// extent the SslLabsApi object using EventEmitter
util.inherits(SslLabsApi, events.EventEmitter);

SslLabsApi.prototype.info = function(){
  this.options.path = SSL_LABS_API_V2 + '/info';
  var req = https.request(this.options, this.infoResponse.bind(this));
  req.end();

  req.on('error', function(e){
    debugLog(e);
  });
}


SslLabsApi.prototype.analyzeHost = function(){
  this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + this.hostToAnalyze;
  var req = https.request(this.options, this.analyzeResponse.bind(this));
  req.end();

  req.on('error', function(e){
    debugLog(e);
  });
}


SslLabsApi.prototype.analyzeHostCached = function(){
  this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + this.hostToAnalyze + '&fromCache=on&all=done';
  var req = https.request(this.options, this.analyzeResponse.bind(this));
  req.end();
  this.startPoll();

  req.on('error', function(e){
    debugLog(e);
  });

  req.on('timeout', function(e){
    debugLog(e);
    req.close();
  });
}


SslLabsApi.prototype.analyzeHostNew = function(){
  debugLog('2 hostToAnalyze = ' + this.hostToAnalyze);
  this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + this.hostToAnalyze + '&startNew=on&all=done';
  var req = https.request(this.options, this.analyzeResponse.bind(this));
  req.end();
  this.startPoll();

  req.on('error', function(e){
    debugLog(e);
  });
}


SslLabsApi.prototype.getEndpointData = function(endpoint){
  this.options.path = SSL_LABS_API_V2 + '/getEndpointData?host=' + this.hostToAnalyze + '&s=' + endpoint;
  var req = https.request(this.options, this.endpointResponse.bind(this));
  req.end();

  req.on('error', function(e){
    debugLog(e);
  });
}


SslLabsApi.prototype.getStatusCodes = function(){
  this.options.path = SSL_LABS_API_V2 + '/getStatusCodes';
  var req = https.request(this.options, this.statusCodesResponse.bind(this));
  req.end();

  req.on('error', function(e){
    debugLog(e);
  });
}


SslLabsApi.prototype.analyzeResponse = function(resp){
  var self = this;
  var respBody = '';

  resp.on('data', function (chunk){
    respBody += chunk;
  });

  resp.on('end', function(){
    var jsonResp = JSON.parse(respBody);
    if (jsonResp.status) {
      if(jsonResp.status === "READY"){
        self.emit('analyzeData', jsonResp);
        clearInterval(intervalObj);
        debugLog("assessment complete");
      } else {
        debugLog(jsonResp.status);
      }
    } else {
      self.emit('endpointData', jsonResp);
    }
  });
}

SslLabsApi.prototype.endpointResponse = function(resp){
  var self = this;
  var respBody = '';

  resp.on('data', function (chunk){
    respBody += chunk;
  });

  resp.on('end', function(){
    var jsonResp = JSON.parse(respBody);
    self.emit('endpointData', jsonResp);
  });
}


SslLabsApi.prototype.statusCodesResponse = function(resp){
  var self = this;
  var respBody = '';

  resp.on('data', function (chunk){
    respBody += chunk;
  });

  resp.on('end', function(){
    var jsonResp = JSON.parse(respBody);
    self.emit('statusCodesData', jsonResp);
  });
}


SslLabsApi.prototype.infoResponse = function(resp){
  var self = this;
  var respBody = '';

  resp.on('data', function (chunk){
    respBody += chunk;
  });

  resp.on('end', function(){
    var jsonResp = JSON.parse(respBody);
    self.emit('infoResponse', jsonResp);
  });
}


SslLabsApi.prototype.pollAnalyzeRequest = function() {
  this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + this.hostToAnalyze;
  var req = https.request(this.options, this.analyzeResponse.bind(this));
  req.end();

  req.on('error', function(e){
    debugLog(e);
  });
}


SslLabsApi.prototype.startPoll = function(){
  debugLog('4 hostToAnalyze = ' + this.hostToAnalyze);
  intervalObj = setInterval(this.pollAnalyzeRequest.bind(this), ANALYZE_POLL_INTERVAL);
}


SslLabsApi.prototype.getEndpointIpAddr = function(data) {
  return data.endpoints[0].ipAddress;
}


module.exports = SslLabsApi;
