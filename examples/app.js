var async = require('async');
var sslLabsApi = require('../ssllabs-api');

var consoleDebug = process.argv[2] || false;
var testhost = process.argv[2] || 'www.f5.com';
var sslApi = sslLabsApi(testhost, consoleDebug);


sslApi.on('analyzeData', function(data){
  sslApi.getEndpointData(sslApi.getEndpointIpAddr(data));
});

sslApi.on('infoResponse', function(data){
  console.log('Received info data: "' + JSON.stringify(data) + '"');
  console.log(data.engineVersion);
});

sslApi.on('endpointData', function(data){
  console.log('Received endpoints data: "' + JSON.stringify(data) + '"');
});

sslApi.on('statusCodesData', function(data){
  console.log('Received status-codes data: "' + JSON.stringify(data) + '"');
});

sslApi.on('error', function(data){
  console.log('Received error event: ', JSON.stringify(data));
}

async.series([
// sslApi.getStatusCodes(),
 sslApi.analyzeHostCached()
]);

