var http = require('http');
var concat = require('concat-stream');

var data = {
    isXml: false,
    url: 'http://jsonplaceholder.typicode.com/posts/1'
};

var jsonData = JSON.stringify(data);

var options = {
  hostname: 'localhost',
  port: 9999,
  path: '/api/typicode',
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
