var http = require('http');
var RequestProcessor = require('./request-processor.js');

var requestProcessor = new RequestProcessor();
var PORT = 9999;

console.log("Starting rest cache server...");

var server = http.createServer(requestProcessor.process);

server.listen(PORT); 

console.log('Started listening on port: ' + PORT);
