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
        var serviceData = JSON.parse(data);

        var postUrl = getUrl(serviceData.hostname, serviceData.port, serviceData.path);

        var service = serviceCache[postUrl];

        if (service) {
            response.end(service.result);
            
            console.log('sent from cache');
        } else {
            sendRequest(serviceData, function (service) {
                serviceCache[postUrl] = service;

                response.end(service.result);
            });
        }
    }));
});

server.listen(9999); 

function sendRequest(service, processResult) {
    console.log('load cache: ' + service);

    var options = {
      hostname: service.hostname,
      port: service.port,
      path: service.path,
      method: service.method
    };

    var requestContent = JSON.stringify(service.data);

    if (requestContent) {
        options.headers = {
            'Content-Type': 'application/json',
            'Content-Length': requestContent.length
        }
    }

    var clientRequest = http.request(options, function(clientResponse) {
        clientResponse.pipe(concat(function (data) {
            console.log(data.toString());

            if (service.isXml) {
                xml2js.parseString(data.toString(), function (err, result) {
                    service.result = JSON.stringify(result);
                });
            } else {
                service.result = data.toString();
            }

            processResult(service);
        }));
    });

    if (requestContent)
        clientRequest.write(requestContent);

    clientRequest.end();
}

function getPath(urlInfo) {
    var index = urlInfo.path.indexOf('?');

    if (index == -1) {
        return urlInfo.path;
    }

    return urlInfo.path.substring(0, index);
}

function getUrl(hostname, port, path) {
    return hostname + ':' + port + path;
}
