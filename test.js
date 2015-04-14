var https = require('https');
var async = require('async');
var sslLabsApi = require('./ssllabs-api');

var sslApi = new sslLabsApi();

https.request(sslApi.info(), sslApi.response.bind(sslApi)).end();

var testhost = 'www.westpac.co.nz';
https.request(sslApi.analyzeHost(testhost), sslApi.response.bind(sslApi)).end();
https.request(sslApi.analyzeHostCached(testhost), sslApi.response.bind(sslApi)).end();
https.request(sslApi.getEndpointData(testhost, '202.7.39.69'), sslApi.response.bind(sslApi)).end();