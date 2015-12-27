var assert = require('assert');
var sinon = require('sinon');
var RequestProcessor = require('../request-processor');

describe('request-processor', function () {
    describe('#process()', function () {
       it('should return error if the request path is not valid', function () {
            var services = [
                {
                    "apiPath": "/api/typicode/posts"
                }
            ]

            var requestProcessor = new RequestProcessor(services);

            var request = {
                url : "http://localhost:9000/api/"
            };

            var mockResponse = {
                end: function() {}
            };

            sinon.stub(mockResponse, 'end');

            requestProcessor.process(request, mockResponse);

            assert.equal(mockResponse.statusCode, 404);

            sinon.assert.calledOnce(mockResponse.end);
            sinon.assert.calledWithMatch(mockResponse.end, '404 - Not Found');
       });
    });
});

//TODO: check if the result came from cache after first call
