var http = require('http');
var restcache = require('./rest-cache.js');

var PORT = 9999;

console.log("Starting rest cache server...");

var server = http.createServer(restcache.processRequest);

server.listen(PORT); 

console.log('Started listening on port: ' + PORT);
