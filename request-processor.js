var http = require('http');
var url = require('url');
var concat = require('concat-stream');
var xml2js = require('xml2js');
var Service = require('./service.js');
var SimpleCache = require('./simple-cache.js');

var serviceCache = new SimpleCache();

function RequestProcessor(services) {
    services.forEach(function(service) {
        serviceCache[service.apiPath] = new Service(service);
    });
}

RequestProcessor.prototype.process = function (request, response) {
    var requestProcessor = this;
    var urlInfo = url.parse(request.url, true);
    var path = getPath(urlInfo);

    var service = serviceCache[path];

    if (!service) {
        response.statusCode = 404;
        response.statusMessage = 'Not Found';
        response.end('404 - Not Found');
        return;
    }

    request.pipe(concat(function (data) {
        processData(service, data, function (result) {
            response.end(result);
        });
    }));
}

function processData(service, data, sendResult) {
    var serviceData = data && data.length > 0 ? JSON.parse(data) : null;

    if (service.result && !service.isExpired()) {
        sendResult(service.result);
        
        console.log('Sent from cache: ' + service.apiPath);
    } else {
        console.log('Load cache: ' + service.apiPath);

        sendRequest(service, serviceData, function (result) {
            service.updateResult(result);

            sendResult(result);
        });
    }
}

function sendRequest(service, serviceData, processResult) {
    var options = {
      hostname: service.hostname,
      port: service.port,
      path: service.path,
      method: service.method
    };

    var requestContent = serviceData ? JSON.stringify(serviceData) : null;

    if (requestContent) {
        options.headers = {
            'Content-Type': 'application/json',
            'Content-Length': requestContent.length
        }
    }

    var clientRequest = http.request(options, function(clientResponse) {
        clientResponse.pipe(concat(function (data) {
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

module.exports = RequestProcessor;
