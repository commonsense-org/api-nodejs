var expect = require('chai').expect,
    config = require('../config'),
    _s = require('underscore.string'),
    CommonSenseApi = require('../../lib/api');

describe('CommonSenseApiEducation()', function() {
  var api = new CommonSenseApi({
    clientId: config.clientId,
    appId: config.appId,
    host: config.host,
  });

  // Dynamically run tests for each type.
  api.education().types.forEach(function(type) {
    var typeName = _s.capitalize(_s.camelize(type));

    describe('#get' + typeName + 'List()', function() {
      it('should get a list of type: ' + type, function(done) {
        getContentTypeList(api, type, {}, function(err, response) {
          expect(response.statusCode).to.be.equal(200);
          expect(response.count).to.be.above(0);

          var items = response.response;
          items.forEach(function(item) {
            expect(item.id).to.be.a('number');
          });

          done();
        });
      });

      it('should get a list using options with type: ' + type, function(done) {
        var options = {
          limit: 11,
          fields: ['id', 'title', 'status', 'created'],
        };

        getContentTypeList(api, type, options, function(err, response) {
          var items = response.response;

          expect(response.statusCode).to.be.equal(200);
          expect(response.count).to.be.above(0);
          expect(items.length).to.be.equal(options.limit);

          items.forEach(function(item) {
            expect(item.id).to.be.a('number');

            // Iterate through object keys and see if only the ones expected show up.
            for (var key in item) {
              expect(options.fields.indexOf(key)).to.be.above(-1);
            }
          });

          done();
        });
      });
    });

    describe('#get' + typeName + 'Item()', function() {
      it('should get a single item of type: ' + type, function(done) {
        getContentTypeItem(api, type, {}, function(err, response) {
          var item = response.response;

          expect(response.statusCode).to.be.equal(200);
          expect(item.id).to.be.a('number');

          done();
        });
      });

      it('should get a content item using options with type: ' + type, function(done) {
        var options = {
          fields: ['id' , 'title', 'status', 'created'],
        };

        getContentTypeItem(api, type, options, function(err, response) {
          var item = response.response;

          expect(response.statusCode).to.be.equal(200);
          expect(item.id).to.be.a('number');

          // Iterate through object keys and see if only the ones expected show up.
          for (var key in item) {
            expect(options.fields.indexOf(key)).to.be.above(-1);
          }

          done();
        });
      });
    });
  });

  describe('#search()', function() {
    this.timeout(5000);

    api.education().types.forEach(function(type) {

      it('should get search results for type: ' + type, function(done) {
        api.education().search(type, 'math', {}, function(err, response) {
          var results = response.response;

          expect(response.statusCode).to.be.equal(200);
          expect(results.length).to.be.above(0);

          done();
        });
      });

      it('should get search results with options for type: ' + type, function(done) {
        var options = {
          limit: 7,
          fields: ['id', 'title', 'type'],
        };

        api.education().search(type, 'math', options, function(err, response) {
          var results = response.response;

          expect(response.statusCode).to.be.equal(200);
          expect(results.length).to.be.above(0);

          results.forEach(function(item) {
            // Iterate through object keys and see if only the ones expected show up.
            for (var key in item) {
              expect(options.fields.indexOf(key)).to.be.above(-1);
            }
          });

          done();
        });
      });
    });
  });
});

/**
 * Helper function to get a list of a given type.
 *
 * @param object
 *   an instance of CommonSenseApi().
 * @param string
 *   the type of data to retrieve (products, blogs, app_flows, lists, user_reviews, boards, users).
 * @param array
 *   filter options that the Common Sense API supports.
 * @param function
 *   the callback function to be called after the async request.
 *   The callback is to take 2 parameters:
 *   - err: an error message if there is a fail.
 *   - response: the JSON response data from the call.
 */
function getContentTypeList(api, type, options, callback) {
  var typeName = _s.capitalize(_s.camelize(type));

  // Get a list of the given type.
  api.education()['get' + typeName + 'List'](options, function(err, response) {
    callback(err, response);
  });
}

/**
 * Helper function to get a random content item of a given type.
 *
 * @param object
 *   an instance of CommonSenseApi().
 * @param string
 *   the type of data to retrieve (products, blogs, app_flows, lists, user_reviews, boards, users).
 * @param array
 *   filter options that the Common Sense API supports.
 * @param function
 *   the callback function to be called after the async request.
 *   The callback is to take 2 parameters:
 *   - err: an error message if there is a fail.
 *   - response: the JSON response data from the call.
 */
function getContentTypeItem(api, type, options, callback) {
  var typeName = _s.capitalize(_s.camelize(type));
  var ids = [];

  // Get a list of IDs of the given type.
  api.education()['get' + typeName + 'List']({ fields: ['id'] }, function(err, response) {
    var items = response.response;

    items.forEach(function(item) {
      ids.push(item.id);
    });

    // Use a random ID from the list to test with.
    var id = ids[Math.floor(Math.random()*ids.length)];
    api.education()['get' + typeName + 'Item'](id, options, function(err, response) {
      callback(err, response);
    });
  });
}
