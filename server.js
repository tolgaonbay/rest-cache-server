var fs = require('fs');
var http = require('http');
var RequestProcessor = require('./request-processor.js');

var PORT = 9999;

console.log("Starting rest cache server...");

var services = JSON.parse(fs.readFileSync('services.json', 'utf8')).services;

console.log("Loaded services: " + services.length);

var requestProcessor = new RequestProcessor(services);

var server = http.createServer(requestProcessor.process);

server.listen(PORT); 

console.log('Started listening on port: ' + PORT);
