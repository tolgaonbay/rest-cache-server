var http = require('http');
var concat = require('concat-stream');

var data = {
    title: 'tolga',
    body: 'test',
    userId: 1403
};

var jsonData = JSON.stringify(data);

var options = {
  hostname: 'localhost',
  port: 9999,
  path: '/api/typicode/posts',
  method: 'POST',
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
