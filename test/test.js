
var testCase  = require('nodeunit').testCase;
var sslLabsApi = require('../ssllabs-api');


var consoleDebug = true; 
var testhost = 'www.f5.com';
var analyzeData = undefined;
var sslApi = sslLabsApi(testhost, consoleDebug);

var expectedOptions = {
    host: 'api.ssllabs.com',
    method: 'GET',
    path: '/'
}
 
module.exports = {
    'Test Options' : function(test) {
      test.expect(1);
      test.deepEqual(sslApi.options, expectedOptions);
      test.done();
    },
    'Test Info' : function(test) {
      test.expect(8);
      sslApi.on('infoResponse', function(data){
        test.notStrictEqual(data, undefined, "Info Response object is not null");
        test.strictEqual(data.engineVersion, "1.18.1", "The version is 1.18.1");
        test.notStrictEqual(data.engineVersion, undefined);
        test.notStrictEqual(data.criteriaVersion, undefined);
        test.notStrictEqual(data.maxAssessments, undefined);
        test.notStrictEqual(data.currentAssessments, undefined);
        test.notStrictEqual(data.messages, undefined);
        test.notStrictEqual(data.clientMaxAssessments, undefined);
        test.done();
      });
      sslApi.info();
    },
    'Test Status Codes' : function(test){
        test.expect(2);
        sslApi.on('statusCodesData', function(data){
          test.notStrictEqual(data, undefined, "Status code object is not null");
          test.notStrictEqual(data.statusDetails, undefined);
          test.done();
        });
        sslApi.getStatusCodes();
    },
   'Test Analyze Cached Data' : function(test){
        test.expect(2);
        sslApi.on('analyzeData', function(data){
          test.notStrictEqual(data, undefined, "Status code object is not null");
          test.notStrictEqual(data.host, undefined);
          analyzeData = data;
          test.done();
        });
        sslApi.analyzeHostCached();
    },
    'Test Endpoint Data' : function(test){
        test.expect(2);
        sslApi.on('endpointData', function(data){
          test.notStrictEqual(data.ipAddress, undefined);
          test.strictEqual(data.serverName, testhost);
          test.done();
        });
        sslApi.getEndpointData(sslApi.getEndpointIpAddr(analyzeData));
    }
};

