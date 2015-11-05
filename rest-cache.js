var http = require('http');
var url = require('url');
var concat = require('concat-stream');
var xml2js = require('xml2js');

var serviceMap = {};

var server = http.createServer(function (request, response) {
    var urlInfo = url.parse(request.url, true);
    var path = getPath(urlInfo);

    if (path != '/api/cache') {
        response.end('err');
        return;
    }

    request.pipe(concat(function (data) {
        var postData = JSON.parse(data.toString());

        var service = serviceMap[postData.url];

        if (service) {
            response.end(service.cache);
            
            console.log('sent from cache');
        } else {
            service = postData;

            console.log('load cache: ' + service);

            http.get(service.url, function (resp) {
                resp.pipe(concat(function(data) {
                    if (service.isXml) {
                        xml2js.parseString(data.toString(), function (err, result) {
                            service.cache = JSON.stringify(result);
                        });
                    } else {
                        service.cache = data.toString();
                    }

                    serviceMap[service.url] = service;

                    response.end(service.cache);
                }));
            });
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
