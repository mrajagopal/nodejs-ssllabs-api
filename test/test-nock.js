var testCase  = require('nodeunit').testCase;
var nock = require('nock');
var sslLabsApi = require('../ssllabs-api');
var sslLabsApiUrlV2 = 'https://api.ssllabs.com/api/v2';

module.exports = {
  'Test Ready Response' : function(test){
    test.expect(1);
    var consoleDebug = false; 
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    var sslApiReqAnalyze = nock(sslLabsApiUrlV2) 
                          .get('/analyze?host=' + testhost + '&startNew=on&all=done')
                          .reply(200, {"status" : "READY"});

    sslApi.on('analyzeData', function(data){
      test.strictEqual(data.status, "READY");
      test.done();
    });

    sslApi.analyzeHostNew();  
  },
  'Test analyzeHostNew() Response' : function(test){
    test.expect(1);
    var consoleDebug = false; 
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    var sslApiReqAnalyzeDns = nock(sslLabsApiUrlV2)
                          .get('/analyze?host=' + testhost + '&startNew=on&all=done')
                          .reply(200, {"status" : "DNS"});

    var sslApiReqAnalyzePoll = nock(sslLabsApiUrlV2)
                          .get('/analyze?host=www.f5.com')
                          .reply(200, {"status" : "IN_PROGRESS"});

    var sslApiReqAnalyzeReady = nock(sslLabsApiUrlV2)
                          .get('/analyze?host=www.f5.com')
                          .reply(200, {"status" : "READY"});


    sslApi.on('analyzeData', function(data){
      test.strictEqual(data.status, "READY");
      test.done();
    });

    sslApi.analyzeHostNew();  
  },
  'Test AnalyzeHostCached() Response' : function(test){
    test.expect(1);
    var consoleDebug = false; 
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    var sslApiReqAnalyze = nock(sslLabsApiUrlV2)
                          .get('/analyze?host=' + testhost + '&fromCache=on&all=done')
                          .reply(200, {"status" : "READY"});

    sslApi.on('analyzeData', function(data){
      test.strictEqual(data.status, "READY");
      test.done();
    });

    sslApi.analyzeHostCached();  
  },
  'Test analyzeHostNew() Unrecognized Response' : function(test){
    test.expect(1);
    var consoleDebug = false; 
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    var sslApiReqAnalyzeUnrecognized = nock(sslLabsApiUrlV2)
                                      .get('/analyze?host=' + testhost + '&startNew=on&all=done')
                                      .reply(200, {"status" : "UNKNOWN"});

    sslApi.on('analyzeData', function(data){
      test.strictEqual(data.status, "READY");
      test.done();
    });

    sslApi.on('error', function(data){
      test.strictEqual(data, "Aborting");
      test.done();
    });
    sslApi.analyzeHostNew();  
  },
  'Test analyzeHostNew() Incomplete Response' : function(test){
    test.expect(1);
    var consoleDebug = false; 
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    var sslApiReqAnalyzeNew = nock(sslLabsApiUrlV2)
                              .get('/analyze?host=' + testhost + '&startNew=on&all=done')
                              .reply(200);

    sslApi.on('analyzeData', function(data){
      test.strictEqual(data.status, "READY");
      test.done();
    });

    sslApi.on('error', function(data){
      test.strictEqual(data, "Aborting");
      test.done();
    });
    sslApi.analyzeHostNew();  
  },
  'Test analyzeHostNew() HTTP Request Error' : function(test){
    test.expect(1);
    var consoleDebug = false; 
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    var sslApiReqAnalyzeNew = nock(sslLabsApiUrlV2)
                              .get('/analyze?host=' + testhost + '&startNew=on&all=done')
                              .socketDelay(6000)
                              .reply(200, {"status" : "READY"});

    sslApi.on('error', function(data){
      test.strictEqual(data, "Aborting");
      test.done();
    });
    sslApi.analyzeHostNew();  
  },
  'Test analyzeHostNew() HTTP Request Error' : function(test){
    test.expect(1);
    var consoleDebug = false; 
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    var sslApiReqAnalyzeNew = nock(sslLabsApiUrlV2)
                              .get('/analyze?host=' + testhost + '&startNew=on&all=done')
                              .socketDelay(6000)
                              .reply(200, {"status" : "READY"});

    sslApi.on('error', function(data){
      test.strictEqual(data, "Aborting");
      test.done();
    });
    sslApi.analyzeHostNew();  
  },
  'Test analyzeHostCached() HTTP Request Error' : function(test){
    test.expect(1);
    var consoleDebug = false; 
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    var sslApiReqAnalyzedHostCached = nock(sslLabsApiUrlV2)
                          .get('/analyze?host=' + testhost + '&fromCache=on&all=done')
                          .socketDelay(6000)
                          .reply(200, {"status" : "READY"});

    sslApi.on('error', function(data){
      test.strictEqual(data, "Aborting");
      test.done();
    });
    sslApi.analyzeHostCached();  
  },
  'Test getEndpointData() HTTP Request Error' : function(test){
    test.expect(1);
    var consoleDebug = false; 
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);
    var endpoint = '1.2.3.4';
    var sslApiReqGetEndpointData = nock(sslLabsApiUrlV2)
                          .get('/getEndpointData?host=' + testhost + '&s='+endpoint)
                          .socketDelay(6000)
                          .reply(200, {"status" : "READY"});

    sslApi.on('error', function(data){
      test.strictEqual(data, "Aborting");
      test.done();
    });
    sslApi.getEndpointData(endpoint);  
  },
   'Test getStatusCodes() HTTP Request Error' : function(test){
    test.expect(1);
    var consoleDebug = false; 
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    var sslApiReqGetStatusCodes = nock(sslLabsApiUrlV2)
                                    .get('/getStatusCodes')
                                    .socketDelay(6000)
                                    .reply(200, {"status" : "READY"});
 
    sslApi.on('error', function(data){
      test.strictEqual(data, "Aborting");
      test.done();
    });
    sslApi.getStatusCodes();  
  }
}

