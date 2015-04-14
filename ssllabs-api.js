"use strict";

var SSL_LABS_API_V2 = "/api/v2";

// Instantiate if one not already created/new'ed
function SslLabsApi(){
	if (!(this instanceof SslLabsApi)){
		return new SslLabsApi();
	}

   	this.options = {
		host: 'api.ssllabs.com',
 		method: 'GET',
 		path: '/',
	}
}

SslLabsApi.prototype.info = function(){
	this.options.path = SSL_LABS_API_V2 + '/info';
	return this.options;
}

SslLabsApi.prototype.analyzeHost = function(host){
	this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + host;
	return this.options;
}

SslLabsApi.prototype.analyzeHostCached = function(host){
	this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + host;
	return this.options;
}

SslLabsApi.prototype.getEndpointData = function(host, endpoint){
	this.options.path = SSL_LABS_API_V2 + '/getEndpointData?host=' + host + '&s=' + endpoint;
	return this.options;
}

SslLabsApi.prototype.response = function(response){
	var str = '';

	response.on('data', function (chunk){
		str += chunk;
	});

	response.on('end', function(){
		console.log(str);
	});
}


module.exports = SslLabsApi;
