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
function SslLabsApi(hostToAnalyze, consoleDebug){
  if (!(this instanceof SslLabsApi)){
    return new SslLabsApi(hostToAnalyze, consoleDebug);
  }

  this.options = {
    host: 'api.ssllabs.com',
    method: 'GET',
    path: '/'
  }

  events.EventEmitter.call(this);
  this.hostToAnalyze = hostToAnalyze;
  this.httpReqTimeoutValueInMs = 5000;
  debug = consoleDebug;
}


// extent the SslLabsApi object using EventEmitter
util.inherits(SslLabsApi, events.EventEmitter);

SslLabsApi.prototype.info = function(){
  var self = this;
  this.options.path = SSL_LABS_API_V2 + '/info';
  var req = https.request(this.options, this.infoResponse.bind(this));
  req.setTimeout(this.httpReqTimeoutValueInMs, function() {
    req.abort();
  });

  req.end();
  req.on('error', function(e){
    debugLog(e);
    clearInterval(intervalObj);
    self.emit('error', 'Aborting');
  });
}


SslLabsApi.prototype.analyzeHost = function(){
  var self = this;
  this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + this.hostToAnalyze;
  debugLog(this.options.path);
  var req = https.request(this.options, this.analyzeResponse.bind(this));
  req.setTimeout(this.httpReqTimeoutValueInMs, function() {
    req.abort();
  });

  req.end();
  req.on('error', function(e){
    debugLog(e);
    clearInterval(intervalObj);
    self.emit('error', 'Aborting');
  });
}


SslLabsApi.prototype.analyzeHostCached = function(){
  var self = this;
  this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + this.hostToAnalyze + '&fromCache=on&all=done';
  debugLog(this.options.path);
  var req = https.request(this.options, this.analyzeResponse.bind(this));
  req.setTimeout(this.httpReqTimeoutValueInMs, function() {
    req.abort();
  });

  req.end();
  this.startPoll();

  req.on('error', function(e){
    debugLog(e);
    clearInterval(intervalObj);
    self.emit('error', 'Aborting');
  });
}


SslLabsApi.prototype.analyzeHostNew = function(){
  var self = this;
  debugLog('2 hostToAnalyze = ' + this.hostToAnalyze);
  this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + this.hostToAnalyze + '&startNew=on&all=done';
  debugLog(this.options.path);
  var req = https.request(this.options, this.analyzeResponse.bind(this));
  req.setTimeout(this.httpReqTimeoutValueInMs, function() {
    req.abort();
  });

  req.end();
  this.startPoll();

  req.on('error', function(e){
    debugLog(e);
    clearInterval(intervalObj);
    self.emit('error', 'Aborting');
  });
}


SslLabsApi.prototype.getEndpointData = function(endpoint){
  var self = this;
  this.options.path = SSL_LABS_API_V2 + '/getEndpointData?host=' + this.hostToAnalyze + '&s=' + endpoint;
  var req = https.request(this.options, this.endpointResponse.bind(this));
  req.setTimeout(this.httpReqTimeoutValueInMs, function() {
    req.abort();
  });

  req.end();
  req.on('error', function(e){
    console.log(e);
    clearInterval(intervalObj);
    self.emit('error', 'Aborting');
  });
}


SslLabsApi.prototype.getStatusCodes = function(){
  var self = this;
  this.options.path = SSL_LABS_API_V2 + '/getStatusCodes';
  var req = https.request(this.options, this.statusCodesResponse.bind(this));
  req.setTimeout(this.httpReqTimeoutValueInMs, function() {
    req.abort();
  });

  req.end();
  req.on('error', function(e){
    debugLog(e);
    clearInterval(intervalObj);
    self.emit('error', 'Aborting');
  });
}


SslLabsApi.prototype.analyzeResponse = function(resp){
  var self = this;
  var respBody = '';

  resp.on('data', function (chunk){
    respBody += chunk;
  });

  resp.on('end', function(){
    debugLog(respBody);
    if (respBody.length){
    var jsonResp = JSON.parse(respBody);
    if (jsonResp.status) {
      if(jsonResp.status === "READY"){
        self.emit('analyzeData', jsonResp);
        clearInterval(intervalObj);
        debugLog("assessment complete");
      } else if((jsonResp.status === "DNS") || (jsonResp.status === "IN_PROGRESS")){
        debugLog(jsonResp.status);
      }else{
        clearInterval(intervalObj);
        self.emit('error', 'Aborting');
      }
    } else {
      self.emit('endpointData', jsonResp);
    }
    }else{
      clearInterval(intervalObj);
      self.emit('error', 'Aborting');
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
