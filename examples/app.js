#!/usr/bin/env node


var sslLabsApi = require('../ssllabs-api');
var SegfaultHandler = require('segfault-handler');
var fs = require("fs");
var program = require('commander');
var validator = require('validator');

// With no argument, SegfaultHandler will generate a generic log file name
SegfaultHandler.registerHandler("crash.log"); 

function getVersion(){
  var sslApi = sslLabsApi('', false);
  return sslApi.version();
};

program.version(getVersion());
program.description('Command line tool for SSL Labs API using Node.js');
program.option('--verbosity', 'Enable verbose logging');
program.option('--host <hostname>', 'Hostname to analyze');
program.option('--grade', 'Output only the hostname: grade');
program.option('--info', 'API command info');
program.option('--codes', 'Get API status codes');
program.option('-u, --usecache', 'Accept cached results (if available), else force live scan');
program.parse(process.argv);

if(!process.argv.slice(2).length){
  program.help();
}

if(program.info){
  var sslApi = sslLabsApi('', program.verbose);
  sslApi.info(); 
}
else if(program.codes){
  var sslApi = sslLabsApi('', program.verbose);
  sslApi.getStatusCodes(); 
}
else if(program.host && !validator.isFQDN(program.host)){
  console.log('  Error: invalid host string');
  program.help();
  process.exit(0);
}

// Assume some defaults if only hostname is provided
if(program.host){
  var sslApi = sslLabsApi(program.host, program.verbose);
  if(program.usecache){
    sslApi.analyzeHostCached();
  }
  else{
    sslApi.analyzeHostNew();
  }
}

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
});


