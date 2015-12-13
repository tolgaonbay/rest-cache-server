var http = require('http');
var url = require('url');
var concat = require('concat-stream');
var xml2js = require('xml2js');
var SimpleCache = require('./simple-cache.js');

var cache = new SimpleCache()

function RequestProcessor() {

}

RequestProcessor.prototype.process = function process(request, response) {
    var requestProcessor = this;
    var urlInfo = url.parse(request.url, true);
    var path = getPath(urlInfo);

    if (path != '/api/cache') {
        response.statusCode = 404;
        response.statusMessage = 'Not Found';
        response.end('404 - Not Found');
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
    if (cache.get(key)) {
        sendResult(cache.get(key).result);
        
        console.log('Sent from cache: ' + key);
    } else {
        console.log('Load cache: ' + key);

        sendRequest(service, function (result) {
            service.result = result;

            cache.put(key, service);

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

module.exports = RequestProcessor;
