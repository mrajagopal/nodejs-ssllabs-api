# nodejs-ssllabs-api
Node.js library to fetch data from SSL Labs API

This is a Node.js module providing basic access to the Qualys SSL Labs API for testing server configuration.
Further details of the API can be found at this URL: https://github.com/ssllabs/ssllabs-scan/blob/master/ssllabs-api-docs.md

## Methods

### info()
This is a wrapper for the API call: Info.
Input parameters: None
A call to this method makes an https request to the info URI.

### analyzeHost()
This is a wrapper for the API call: analyze.
Input parameters: None
A call to this method returns an HTTPS request to the analyze URI.

### analyzeHostCached()
This is a wrapper for the API call: analyze with flag for cached-response set to TRUE.
Input parameters: None
A call to this method returns the options object with the appropriate parameters for the analyze API call.  This is then fed into an https.request() call.

### analyzeHostNew()
This is a wrapper for the API call: analyze with flag for startNew set to TRUE.
Input parameters: host: None
A call to this method returns the options object with the appropriate parameters for the analyze API call.  This is then fed into an https.request() call.

### getEndpointData(endpoint)
A call to this method returns the options object with the appropriate parameters for the getEndpointData API call.  This is then fed into an https.request() call.

### getStatusCodes()
No input parameters required.
A call to this method returns the options object with the appropriate parameters for the getStatusCodes API call.  This is then fed into an https.request() call.

### response()
No input parameters required.
This method is typically passed to https.request() method as a callback.
This method outputs the response of any of the above API calls.
