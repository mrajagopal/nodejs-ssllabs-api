var testCase  = require('nodeunit').testCase;
var nock = require('nock');
var sslLabsApi = require('../ssllabs-api');

module.exports = {
  'Test Analysis Ready Response' : function(test){
    test.expect(1);
    var consoleDebug = false; 
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    var sslApiReqAnalyze = nock('https://api.ssllabs.com/api/v2')
                          .get('/analyze?host=www.f5.com&startNew=on&all=done')
                          .reply(200, {"status" : "READY"});

    sslApi.on('analyzeData', function(data){
      test.strictEqual(data.status, "READY");
      test.done();
    });

    sslApi.analyzeHostNew();  
  },
  'Test Analyze New Response' : function(test){
    test.expect(1);
    var consoleDebug = false; 
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    var sslApiReqAnalyzeDns = nock('https://api.ssllabs.com/api/v2')
                          .get('/analyze?host=www.f5.com&startNew=on&all=done')
                          .reply(200, {"status" : "DNS"});

    var sslApiReqAnalyzePoll = nock('https://api.ssllabs.com/api/v2')
                          .get('/analyze?host=www.f5.com')
                          .reply(200, {"status" : "IN_PROGRESS"});

    var sslApiReqAnalyzeReady = nock('https://api.ssllabs.com/api/v2')
                          .get('/analyze?host=www.f5.com')
                          .reply(200, {"status" : "READY"});


    sslApi.on('analyzeData', function(data){
      test.strictEqual(data.status, "READY");
      test.done();
    });

    sslApi.analyzeHostNew();  
  },
  'Test Analyze Unrecognized Response' : function(test){
    test.expect(1);
    var consoleDebug = false; 
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    var sslApiReqAnalyzeUnrecognized = nock('https://api.ssllabs.com/api/v2')
                          .get('/analyze?host=www.f5.com&startNew=on&all=done')
                          .reply(200, {"status" : "UNKNOWN"});

    sslApi.on('analyzeData', function(data){
      test.strictEqual(data.status, "READY");
      test.done();
    });

    sslApi.on('Error', function(data){
      test.strictEqual(data, "Aborting");
      test.done();
    });
    sslApi.analyzeHostNew();  
  },
  'Test Analyze Incomplete Response' : function(test){
    test.expect(1);
    var consoleDebug = false; 
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    var sslApiReqAnalyzeUnrecognized = nock('https://api.ssllabs.com/api/v2')
                          .get('/analyze?host=www.f5.com&startNew=on&all=done')
                          .reply(200);

    sslApi.on('analyzeData', function(data){
      test.strictEqual(data.status, "READY");
      test.done();
    });

    sslApi.on('Error', function(data){
      test.strictEqual(data, "Aborting");
      test.done();
    });
    sslApi.analyzeHostNew();  
  }
}

