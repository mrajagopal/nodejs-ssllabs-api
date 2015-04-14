# nodejs-ssllabs-api
Node.js library to fetch data from SSL Labs API

This is a Node.js module providing basic access to the Qualys SSL Labs API for testing server configuration.
Further details of the API can be found at this URL: https://github.com/ssllabs/ssllabs-scan/blob/master/ssllabs-api-docs.md

## Methods

### info()
This is a wrapper for the API call: Info.
No input parameters required.  
A call to this method returns the options object with the appropriate parameters for the info API call.  This is then fed into an https.request() call.

### analyzeHost(host)
This is a wrapper for the API call: analyze.
Input parameters: host: as a domain name
A call to this method returns the options object with the appropriate parameters for the analyze API call.  This is then fed into an https.request() call.

### analyzeHostCached(host)
This is a wrapper for the API call: analyze with flag for cached-response set to TRUE.
Input parameters: host: as a domain name
A call to this method returns the options object with the appropriate parameters for the analyze API call.  This is then fed into an https.request() call.

### analyzeHostNew(host)
This is a wrapper for the API call: analyze with flag for startNew set to TRUE.
Input parameters: host: as a domain name
A call to this method returns the options object with the appropriate parameters for the analyze API call.  This is then fed into an https.request() call.

### getEndpointData(host, endpoint)
A call to this method returns the options object with the appropriate parameters for the getEndpointData API call.  This is then fed into an https.request() call.

### response()
No input parameters required.
This method is typically passed to https.request() method as a callback.
This method outputs the response of any of the above API calls.
