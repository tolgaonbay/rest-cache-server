var http = require('http');
var concat = require('concat-stream');

var options = {
  hostname: 'localhost',
  port: 9999,
  path: '/api/typicode/posts/post',
  method: 'GET'
};

var request = http.request(options, function(response) {
    response.pipe(concat(function (data) {
        console.log(data.toString());
    }));
});

request.end();
