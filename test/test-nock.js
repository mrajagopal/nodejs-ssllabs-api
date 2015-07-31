var testCase  = require('nodeunit').testCase;
var nock = require('nock');
var sslLabsApi = require('../ssllabs-api');
var sslLabsApiUrlV2 = 'https://api.ssllabs.com/api/v2';

module.exports = testCase({
  'Test Ready Response' : function(test){
    test.expect(1);
    var consoleDebug = false;
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    nock(sslLabsApiUrlV2)
      .get('/analyze?host=' + testhost + '&startNew=on&all=done')
      .reply(200, {"status" : "READY"});

    sslApi.on('analyzeData', function(data){
      test.strictEqual(data.status, "READY");
      test.done();
    });

    sslApi.analyzeHostNew();
  },
  'Test Info() Response' : function(test){
    test.expect(6);
    var consoleDebug = false;
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    nock(sslLabsApiUrlV2)
      .get('/info')
      .reply(200, {"version" : "1.1.1.1",
                   "criteriaVersion" : "1.1",
                   "maxAssessments" : "10",
                   "currentAssessments" : "5",
                   "messages" : "ok",
                   "clientMaxAssessments" : "2"});

    sslApi.on('infoResponse', function(data){
      test.ok(data.version);
      test.ok(data.criteriaVersion);
      test.ok(data.maxAssessments);
      test.ok(data.currentAssessments);
      test.ok(data.messages);
      test.ok(data.clientMaxAssessments);
      test.done();
    });

    sslApi.info();
  },
  'Test analyzeHostNew() Response' : function(test){
    test.expect(1);
    var consoleDebug = false;
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    nock(sslLabsApiUrlV2)
      .get('/analyze?host=' + testhost + '&startNew=on&all=done')
      .reply(200, {"status" : "DNS"});

    nock(sslLabsApiUrlV2)
      .get('/analyze?host=www.f5.com')
      .reply(200, {"status" : "IN_PROGRESS"});

    nock(sslLabsApiUrlV2)
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
    var maxAge = '1';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    nock(sslLabsApiUrlV2)
      .get('/analyze?host=' + testhost + '&fromCache=on&all=done&maxAge=' + maxAge)
      .reply(200, {"status" : "READY"});

    sslApi.on('analyzeData', function(data){
      test.strictEqual(data.status, "READY");
      test.done();
    });

    sslApi.analyzeHostCached(maxAge);
  },
  'Test analyzeHostNew() Unrecognized Response' : function(test){
    test.expect(1);
    var consoleDebug = false;
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    nock(sslLabsApiUrlV2)
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

    nock(sslLabsApiUrlV2)
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
    var consoleDebug = true;
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    function handleError(data){
      test.strictEqual(data, "Aborting");
      test.done();
    }

    nock(sslLabsApiUrlV2)
      .get('/analyze?host=' + testhost + '&startNew=on&all=done')
      .socketDelay(6000)
      .reply(200, {"status" : "READY"});

    sslApi.on('error', handleError);

    sslApi.analyzeHostNew();
  },
  'Test analyzeHostCached() HTTP Request Error' : function(test){
    test.expect(1);
    var consoleDebug = false;
    var testhost = 'www.f5.com';
    var maxAge = '1';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    function handleError(data){
      test.strictEqual(data, "Aborting");
      test.done();
    }

    nock(sslLabsApiUrlV2)
      .get('/analyze?host=' + testhost + '&fromCache=on&all=done&maxAge=' + maxAge)
      .socketDelay(6000)
      .reply(200, {"status" : "READY"});

    sslApi.on('error', handleError);

    sslApi.analyzeHostCached(maxAge);
  },
  'Test getEndpointData() HTTP Request Error' : function(test){
    test.expect(1);
    var consoleDebug = false;
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);
    var endpoint = '1.2.3.4';

    function handleError(data){
      test.strictEqual(data, "Aborting");
      test.done();
    }

    nock(sslLabsApiUrlV2)
      .get('/getEndpointData?host=' + testhost + '&s='+endpoint)
      .socketDelay(6000)
      .reply(200, {"status" : "READY"});

    sslApi.on('error', handleError);
    sslApi.getEndpointData(endpoint);

  },
   'Test getStatusCodes() HTTP Request Error' : function(test){
    test.expect(1);
    var consoleDebug = false;
    var testhost = 'www.f5.com';
    var sslApi = sslLabsApi(testhost, consoleDebug);

    function handleError(data){
      test.strictEqual(data, "Aborting");
      test.done();
    }

    nock(sslLabsApiUrlV2)
      .get('/getStatusCodes')
      .socketDelay(6000)
      .reply(200, {"status" : "READY"});

    sslApi.on('error', handleError);
    sslApi.getStatusCodes();
  }
});
