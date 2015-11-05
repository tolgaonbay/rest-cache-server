var http = require('http');
var url = require('url');
var concat = require('concat-stream');
var xml2js = require('xml2js');

var isXml = false;

var serviceMap = {};

serviceMap['/api/typicode'] = {
    isXml: false,
    url: 'http://jsonplaceholder.typicode.com/posts/1'
};

serviceMap['/api/tcmb'] = {
    isXml: true,
    url: 'http://www.tcmb.gov.tr/kurlar/today.xml'
}

var server = http.createServer(function (request, response) {
    var urlInfo = url.parse(request.url, true);
    var path = getPath(urlInfo);

    var service = serviceMap[path];

    if (!service) {
        response.end('err');
        return;
    }

    if (!service.cache) {
        http.get(service.url, function (resp) {
            resp.pipe(concat(function(data) {
                if (service.isXml) {
                    xml2js.parseString(data.toString(), function (err, result) {
                        service.cache = JSON.stringify(result);
                    });
                } else {
                    service.cache = data.toString();
                }
                response.end(service.cache);
            }));
        });
    } else {
        response.end(service.cache);
        console.log('sent from cache');
    }

});

server.listen(9999); 

function getPath(urlInfo) {
    var index = urlInfo.path.indexOf('?');

    if (index == -1) {
        return urlInfo.path;
    }

    return urlInfo.path.substring(0, index);
}
