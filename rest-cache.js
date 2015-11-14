var http = require('http');
var url = require('url');
var concat = require('concat-stream');
var xml2js = require('xml2js');

var serviceCache = {};

var server = http.createServer(function (request, response) {
    var urlInfo = url.parse(request.url, true);
    var path = getPath(urlInfo);

    if (path != '/api/cache') {
        response.end('err');
        return;
    }

    request.pipe(concat(function (data) {
        var postData = JSON.parse(data);

        var postUrl = postData.hostname + ':' + postData.port + postData.path;

        var service = serviceCache[postUrl];

        if (service) {
            response.end(service.cache);
            
            console.log('sent from cache');
        } else {
            service = postData;

            console.log('load cache: ' + service);

            var jsonData = JSON.stringify(service.data);

            var options = {
              hostname: service.hostname,
              port: service.port,
              path: service.path,
              method: service.method
            };

            if (jsonData) {
                options.headers = {
                    'Content-Type': 'application/json',
                    'Content-Length': jsonData.length
                }
            }

            var clientRequest = http.request(options, function(clientResponse) {
                clientResponse.pipe(concat(function (data) {
                    console.log(data.toString());

                    if (service.isXml) {
                        xml2js.parseString(data.toString(), function (err, result) {
                            service.cache = JSON.stringify(result);
                        });
                    } else {
                        service.cache = data.toString();
                    }

                    serviceCache[postUrl] = service;

                    response.end(service.cache);
                }));
            });

            if (jsonData)
                clientRequest.write(jsonData);

            clientRequest.end();
        }
    }));
});

server.listen(9999); 

function getPath(urlInfo) {
    var index = urlInfo.path.indexOf('?');

    if (index == -1) {
        return urlInfo.path;
    }

    return urlInfo.path.substring(0, index);
}
