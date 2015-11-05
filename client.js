var http = require('http');
var concat = require('concat-stream');

var data = {
    isXml: false,
    hostname: 'jsonplaceholder.typicode.com',
    port: 80,
    path: '/posts/1',
    method: 'GET',
};

var jsonData = JSON.stringify(data);

var options = {
  hostname: 'localhost',
  port: 9999,
  path: '/api/cache',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': jsonData.length
  }
};

var request = http.request(options, function(response) {
    response.pipe(concat(function (data) {
        console.log(data.toString());
    }));
});

request.write(jsonData);

request.end();
