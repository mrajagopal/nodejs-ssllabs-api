<a href="https://codeclimate.com/github/mrajagopal/nodejs-ssllabs-api"><img src="https://codeclimate.com/github/mrajagopal/nodejs-ssllabs-api/badges/gpa.svg" /></a>
<a href="https://codeclimate.com/github/mrajagopal/nodejs-ssllabs-api/coverage"><img src="https://codeclimate.com/github/mrajagopal/nodejs-ssllabs-api/badges/coverage.svg" /></a>
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

### License
Copyright (c) 2010-2015 Brian Carlson (rajagopal.madhu@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
