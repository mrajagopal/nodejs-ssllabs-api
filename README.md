# nodejs-ssllabs-api
Node.js library to fetch data from SSL Labs API

This is a Node.js module providing basic access to the Qualys SSL Labs API for testing server configuration.
Further details of the API can be found at this URL: https://github.com/ssllabs/ssllabs-scan/blob/master/ssllabs-api-docs.md

## Methods

### info()
Input parameters: None
A call to this method makes an HTTPS request to the info URI.

### analyzeHostNew()
Input parameters: host: None
A call to this method makes an HTTPS request to the analyze URI. Use this method to obtain fresh test results for a particular hosts.

### analyzeHost()
Input parameters: None
Note: This is information only. A call to this method makes an HTTPS request to the analyze URI.  Use this method after calling analyzeHostNew() to periodically check when an assessment is finished.  This is being done in the background and on successful completion or error an event is emitted to the caller. 

### analyzeHostCached()
Input parameters: None
A call to this method makes an HTTPS request to the anaylze URI with the fromCache option "on".  If the result requested is available it will be returned straight away.  Otherwise a new assessment is started.

### getEndpointData(endpoint)
Input parameters: endpoint ip-address
A call to this method makes an HTTPS request to the getEndpointData URI with endpoint ip-address. This returns a single endpoint object that contains the complete assessment information.  This will emit a 'endpointData' event with associated response data of the endpoint.

### getStatusCodes()
Input parameters: None
A call to this method makes an HTTPS request to the getStatusCodes URI.  This will emit a 'statusCodesData' event and associated response data of status codes and corresponding English translations.

Events emitted:
*analyzeData
*endpointData
*statusCodesData
*response
