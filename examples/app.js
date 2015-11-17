var sslLabsApi = require('../ssllabs-api');
var profiler = require('v8-profiler');
var fs = require("fs");
var program = require('commander');
var supportedApiCmds = ['info', 'analyzeHost', 'analyzeHostCached', 'analyzeHostNew', 'getStatusCodes'];
var supportedApiHostCmds = ['analyzeHost', 'analyzeHostCached', 'analyzeHostNew'];
var supportedApiNonHostCmds = ['info', 'getStatusCodes'];
var cmdsReqArgs = ['analyzeHostCached'];
profiler.startProfiling("trace");


program.version('0.0.1');
program.description('Command line tool for SSL Labs API using Node.js');
program.option('-v, --verbose', 'Enable verbose logging');
program.option('-hn, --host <hostname>', 'Hostname to analyze');
program.option('-c, --command <cmd>', 'API command to invoke');
program.option('-a, --argsToCmd <args>', 'arguments to the API command if applicable');
program.parse(process.argv);

if(!process.argv.slice(2).length){
  program.help();
}

if (program.verbose){
  console.log('Host: ', program.host);
  console.log('Cmd: ', program.command);
  console.log('Args: ', program.argsToCmd);
}

if(!program.host && (supportedApiHostCmds.indexOf(program.command) !== -1)){
  console.log('\r\n  Error: Please provide a host to analyze ');
  program.help();
}
else if(supportedApiNonHostCmds.indexOf(program.command) !== -1){
  var sslApi = sslLabsApi('', program.verbose);
  sslApi[program.command](program.argsToCmd); 
}
else{
  var sslApi = sslLabsApi(program.host, program.verbose);
  sslApi[program.command](program.argsToCmd); 
}

sslApi.on('analyzeData', function(data){
  sslApi.getEndpointData(sslApi.getEndpointIpAddr(data));
});

sslApi.on('infoResponse', function(data){
  console.log('Received info data: "' + JSON.stringify(data) + '"');
  console.log(data.engineVersion);
});

sslApi.on('endpointData', function(data){
  var profData = profiler.stopProfiling("trace");
  fs.writeFileSync("sslLabsApi."+ program.host + ".cpuprofile", JSON.stringify(profData));
  console.log('Received endpoints data: "' + JSON.stringify(data) + '"');
});

sslApi.on('statusCodesData', function(data){
  console.log('Received status-codes data: "' + JSON.stringify(data) + '"');
});

sslApi.on('error', function(data){
  console.log('Received error event: ', JSON.stringify(data));
});


