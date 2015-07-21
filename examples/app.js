var sslLabsApi = require('../ssllabs-api');
var profiler = require('v8-profiler');
var fs = require("fs");
profiler.startProfiling("trace");

var consoleDebug = process.argv[3] || false;
var hostToAnalyze = process.argv[2] || 'www.f5.com';
var sslApi = sslLabsApi(hostToAnalyze, consoleDebug);


sslApi.on('analyzeData', function(data){
  sslApi.getEndpointData(sslApi.getEndpointIpAddr(data));
});

sslApi.on('infoResponse', function(data){
  console.log('Received info data: "' + JSON.stringify(data) + '"');
  console.log(data.engineVersion);
});

sslApi.on('endpointData', function(data){
  var profData = profiler.stopProfiling("trace");
  fs.writeFileSync("sslLabsApi."+ hostToAnalyze + ".cpuprofile", JSON.stringify(profData));
  console.log('Received endpoints data: "' + JSON.stringify(data) + '"');
});

sslApi.on('statusCodesData', function(data){
  console.log('Received status-codes data: "' + JSON.stringify(data) + '"');
});

sslApi.on('error', function(data){
  console.log('Received error event: ', JSON.stringify(data));
});

//async.series([
// sslApi.getStatusCodes(),
sslApi.analyzeHostCached('1');
//]);

