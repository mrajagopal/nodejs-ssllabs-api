"use strict";

var util = require('util');
var https = require('https');
var SSL_LABS_API_V2 = "/api/v2";
var intervalObj;
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

  if(!hostToAnalyze){
    throw new TypeError('host parameter not supplied');
//    this.emit('error', 'host parameter not supplied');
  }

  this.options = {
    host: 'api.ssllabs.com',
    method: 'GET',
    path: '/'
  };

  events.EventEmitter.call(this);
  this.hostToAnalyze = hostToAnalyze;
  this.httpReqTimeoutValueInMs = 5000;
  debug = consoleDebug;
}

// extent the SslLabsApi object using EventEmitter
util.inherits(SslLabsApi, events.EventEmitter);


SslLabsApi.prototype._emitError = function _emitError(e){
  debugLog(e);
  clearInterval(intervalObj);
  this.emit('error', 'Aborting');
};


SslLabsApi.prototype.info = function info(){
  this.options.path = SSL_LABS_API_V2 + '/info';
  var req = https.request(this.options, this.infoResponse.bind(this));
  req.setTimeout(this.httpReqTimeoutValueInMs, function() {
    req.abort();
  });

  req.on('error', this._emitError.bind(this));
  req.end();
};


SslLabsApi.prototype.analyzeHost = function analyzeHost(){
  var self = this;
  this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + this.hostToAnalyze;
  debugLog(this.options.path);
  var req = https.request(this.options, this.analyzeResponse.bind(this));
  req.setTimeout(this.httpReqTimeoutValueInMs, function() {
    req.abort();
  });

  req.on('error', this._emitError.bind(this));
  req.end();
};


SslLabsApi.prototype.analyzeHostCached = function analyzeHostCached(maxAge){
  var self = this;
  this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + this.hostToAnalyze + '&fromCache=on&all=done' + '&maxAge=' + maxAge;
  debugLog(this.options.path);
  var req = https.request(this.options, this.analyzeResponse.bind(this));

  function handleTimeout(){
    debugLog('Request timed out');
    clearInterval(intervalObj);
    req.abort();
  }

  req.setTimeout(this.httpReqTimeoutValueInMs, handleTimeout);
  req.end();
  this.startPoll();

 req.on('error', this._emitError.bind(this));
};


//SslLabsApi.prototype.handleTimeout = function handleTimeout(req) {
//  console.log('setTimeout callback invoked');
//  // self._emitError('Request timed out');
//  debugLog('proto Request timed out');
//  clearInterval(intervalObj);
////  this.emit('error', 'Aborting');
//  req.abort();
//};

SslLabsApi.prototype.analyzeHostNew = function analyzeHostNew(){
  var self = this;
  debugLog('2 hostToAnalyze = ' + this.hostToAnalyze);
  this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + this.hostToAnalyze + '&startNew=on&all=done';
  debugLog(this.options.path);
  var req = https.request(this.options, this.analyzeResponse.bind(this));

  function handleTimeout(){
    debugLog('Request timed out');
    clearInterval(intervalObj);
    req.abort();
  }

  req.setTimeout(this.httpReqTimeoutValueInMs, handleTimeout);
  req.on('error', this._emitError.bind(this));
  req.end();
  this.startPoll();
};

SslLabsApi.prototype.getEndpointData = function getEndpointData(endpoint){
  var self = this;
  this.options.path = SSL_LABS_API_V2 + '/getEndpointData?host=' + this.hostToAnalyze + '&s=' + endpoint;
  var req = https.request(this.options, this.endpointResponse.bind(this));

  function handleTimeout(){
    debugLog('Request timed out');
    clearInterval(intervalObj);
    req.abort();
  }

  req.setTimeout(this.httpReqTimeoutValueInMs, handleTimeout);
  req.on('error', this._emitError.bind(this));
  req.end();
};

SslLabsApi.prototype.getStatusCodes = function getStatusCodes(){
  var self = this;
  this.options.path = SSL_LABS_API_V2 + '/getStatusCodes';
  var req = https.request(this.options, this.statusCodesResponse.bind(this));

  function handleTimeout(){
    debugLog('Request timed out');
    clearInterval(intervalObj);
    req.abort();
  }

  req.setTimeout(this.httpReqTimeoutValueInMs, handleTimeout);
  req.end();
  req.on('error', this._emitError.bind(this));
};


SslLabsApi.prototype.analyzeResponse = function analyzeResponse(resp){
  var self = this;
  var respBody = '';

  resp.on('data', function (chunk){
    respBody += chunk;
  });

  resp.on('Error', function(e){
    console.log('This is the error dump', e);
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
};

SslLabsApi.prototype.endpointResponse = function endpointResponse(resp){
  var self = this;
  var respBody = '';

  resp.on('data', function (chunk){
    respBody += chunk;
  });

  resp.on('end', function(){
    var jsonResp = JSON.parse(respBody);
    self.emit('endpointData', jsonResp);
  });
};


SslLabsApi.prototype.statusCodesResponse = function statusCodesResponse(resp){
  var self = this;
  var respBody = '';

  resp.on('data', function (chunk){
    respBody += chunk;
  });

  resp.on('end', function(){
    var jsonResp = JSON.parse(respBody);
    self.emit('statusCodesData', jsonResp);
  });
};


SslLabsApi.prototype.infoResponse = function infoResponse(resp){
  var self = this;
  var respBody = '';

  resp.on('data', function (chunk){
    respBody += chunk;
  });

  resp.on('end', function(){
    var jsonResp = JSON.parse(respBody);
    self.emit('infoResponse', jsonResp);
  });
};


SslLabsApi.prototype.pollAnalyzeRequest = function pollAnalyzeRequest() {
  var self = this;
  this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + this.hostToAnalyze;
  var req = https.request(this.options, this.analyzeResponse.bind(this));

  function handleTimeout(){
    debugLog('Request timed out');
    clearInterval(intervalObj);
    req.abort();
  }

  req.setTimeout(this.httpReqTimeoutValueInMs, handleTimeout);
  req.on('error', this._emitError.bind(this));
  req.end();
};


SslLabsApi.prototype.startPoll = function startPoll(){
  debugLog('4 hostToAnalyze = ' + this.hostToAnalyze);
  intervalObj = setInterval(this.pollAnalyzeRequest.bind(this), ANALYZE_POLL_INTERVAL);
};


SslLabsApi.prototype.getEndpointIpAddr = function getEndpointIpAddr(data) {
  return data.endpoints[0].ipAddress;
};


module.exports = SslLabsApi;
