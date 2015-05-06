"use strict";

var util = require('util');
var https = require('https');
var SSL_LABS_API_V2 = "/api/v2";
var intervalObj = undefined;
var events = require('events');


// Instantiate if one not already created/new'ed
function SslLabsApi(hostToAnalyze){
	if (!(this instanceof SslLabsApi)){
		return new SslLabsApi();
	}

   	this.options = {
		host: 'api.ssllabs.com',
 		method: 'GET',
 		path: '/'
	}

	this.hostToAnalyze = hostToAnalyze;
}


// extend the SslLabsApi object using EventEmitter
util.inherits(SslLabsApi, events.EventEmitter);

SslLabsApi.prototype.info = function(){
	this.options.path = SSL_LABS_API_V2 + '/info';
	https.request(this.options, this.response.bind(this)).end();
}


SslLabsApi.prototype.analyzeHost = function(){
	this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + this.hostToAnalyze;
	https.request(this.options, this.analyzeResponse.bind(this)).end();
}


SslLabsApi.prototype.analyzeHostCached = function(){
	this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + this.hostToAnalyze + '&fromCache=on&all=done';
	https.request(this.options, this.analyzeResponse.bind(this)).end();
}


SslLabsApi.prototype.analyzeHostNew = function(){
	console.log('2 hostToAnalyze = ' + this.hostToAnalyze);
	this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + this.hostToAnalyze + '&startNew=on&all=done';
	// return this.options;
	https.request(this.options, this.analyzeResponse.bind(this)).end();
	this.startPoll();
}


SslLabsApi.prototype.getEndpointData = function(endpoint){
	this.options.path = SSL_LABS_API_V2 + '/getEndpointData?host=' + this.hostToAnalyze + '&s=' + endpoint;
	https.request(this.options, this.endpointResponse.bind(this)).end();
}


SslLabsApi.prototype.getStatusCodes = function(){
	this.options.path = SSL_LABS_API_V2 + '/getStatusCodes';
	https.request(this.options, this.statusCodesResponse.bind(this)).end();
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
				console.log("assessment complete");
			} else {
			console.log(jsonResp.status);
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


SslLabsApi.prototype.response = function(resp){
	var self = this;
	var respBody = '';

	resp.on('data', function (chunk){
		respBody += chunk;
	});

	resp.on('end', function(){
		var jsonResp = JSON.parse(respBody);
		self.emit('response', jsonResp);
	});
}


SslLabsApi.prototype.pollAnalyzeRequest = function() {
	this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + this.hostToAnalyze;
	https.request(this.options, this.analyzeResponse.bind(this)).end();
}


SslLabsApi.prototype.startPoll = function(){
	console.log('4 hostToAnalyze = ' + this.hostToAnalyze);
	intervalObj = setInterval(this.pollAnalyzeRequest.bind(this), 30000);
}


SslLabsApi.prototype.getEndpointIpAddr = function(data) {
	return data.endpoints[0].ipAddress;
}


module.exports = SslLabsApi;
