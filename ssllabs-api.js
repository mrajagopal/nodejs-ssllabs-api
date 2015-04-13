"use strict";

var https = require('https'),
    SSL_LABS_API_V2 = "/api/v2";

// Instantiate if one not already created/new'ed
function SslLabsApi(){
	if (!(this instanceof SslLabsApi)){
		return new SslLabsApi();
	}

   	this.options = {
		host: 'api.ssllabs.com',
 		method: 'GET',
 		path: '/',
 		publish: 'off',
 		startNew: 'off',
 		fromCache: 'off',
 		maxAge: 'null',
 		all: 'done',
 		ignoreMismatch: 'off'
	}
}

SslLabsApi.prototype.info = function(){
	this.options.path = SSL_LABS_API_V2 + '/info';
	return this.options;
}

SslLabsApi.prototype.fetchHostInformation = function(host){
	this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + host;
	return this.options;
}

SslLabsApi.prototype.fetchHostInformationCached = function(host){
	this.options.path = SSL_LABS_API_V2 + '/analyze?host=' + host;
	return this.options;
}

SslLabsApi.prototype.fetchEndpointData = function(host){
	this.options.path = SSL_LABS_API_V2 + '/getEndpointData?host=' + host;
	return this.options;
}

SslLabsApi.prototype.verify = function(response){
	var str = '';

	response.on('data', function (chunk){
		str += chunk;
	});

	response.on('end', function(){
		console.log(str);
	});
}

var sslApi = new SslLabsApi();
https.request(sslApi.info(), sslApi.verify.bind(sslApi)).end();


var testhost = 'www.westpac.co.nz';
https.request(sslApi.fetchHostInformation(testhost), sslApi.verify.bind(sslApi)).end();