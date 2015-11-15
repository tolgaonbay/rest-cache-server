var http = require('http');
var url = require('url');
var concat = require('concat-stream');
var xml2js = require('xml2js');

var serviceCache = {};

module.exports.processRequest = processRequest;

function processRequest(request, response) {
    var urlInfo = url.parse(request.url, true);
    var path = getPath(urlInfo);

    if (path != '/api/cache') {
        response.end('err');
        return;
    }

    request.pipe(concat(function (data) {
        processData(data, function (result) {
            response.end(result);
        });
    }));
}

function processData(data, sendResult) {
    var service = JSON.parse(data);

    var key = getServiceHash(service);
    if (serviceCache[key]) {
        sendResult(serviceCache[key].result);
        
        console.log('sent from cache');
    } else {
        console.log('load cache: ' + service);

        sendRequest(service, function (result) {
            service.result = result;

            serviceCache[key] = service;

            sendResult(result);
        });
    }
}

function sendRequest(service, processResult) {
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

            var result;

            if (service.isXml) {
                xml2js.parseString(data.toString(), function (err, result) {
                    result = JSON.stringify(result);
                });
            } else {
                result = data.toString();
            }

            processResult(result);
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

function getServiceHash(service) {
    return service.hostname + ':' + service.port + service.path;
}

