var expect = require('chai').expect,
    config = require('./config'),
    CommonSenseApi = require('../lib/api');

describe('Common Sense API Tests', function() {
  var api = new CommonSenseApi({
    clientId: config.clientId,
    appId: config.appId,
    host: config.host,
  });

  // Test using the education API.
  api.platform = 'education';

  describe('CommonSenseApi()', function() {
    describe('init', function() {
      it('should load options when instantiated.', function() {
        expect(api.clientId).to.be.equal(config.clientId);
        expect(api.appId).to.be.equal(config.appId);
      });

      it('should override host if defined, defaulted to production.', function() {
        var apiHost = new CommonSenseApi({
          clientId: config.clientId,
          appId: config.appId,
        });
        expect(apiHost.host).to.be.equal('https://api.commonsense.org');

        var apiHost = new CommonSenseApi({
          clientId: config.clientId,
          appId: config.appId,
          host: 'http://foobar.com',
        });
        expect(apiHost.host).to.be.equal('http://foobar.com');
      });
    });

    describe('#request()', function() {
      it('should make a request to an external service.', function(done) {
        api.request('users/1', {}, function(err, response) {
          var user = response.response;
          expect(user.id).to.be.equal(1);
          expect(user.first_name).to.be.equal('testing');
          expect(user.last_name).to.be.equal('tester');
          expect(user.display_name).to.be.equal('testing t.');
          done();
        });
      });

      it('should return a 401 authentication error.', function(done) {
        var clientId = api.clientId;
        api.clientId = 'foobar';

        api.request('users/1', {}, function(err, response) {
          expect(response.statusCode).to.be.equal(401);
          api.clientId = clientId;
          done();
        });
      });

      it('should return a 404 page not found error.', function(done) {
        api.request('foo', {}, function(err, response) {
          expect(response.statusCode).to.be.equal(404);
          done();
        });
      });

      it('should override default query parameters.', function(done) {
        api.request('foo', {}, function(err, response) {
          expect(api.query.limit).to.be.equal(10);
          expect(api.query.page).to.be.equal(1);

          var options = {
            limit: 15,
            page: 3,
            fields: ['hello', 'world'],
          };

          api.request('foo', options, function(err, response) {
            expect(api.query.limit).to.be.equal(15);
            expect(api.query.page).to.be.equal(3);
            expect(api.query.fields).to.be.equal('hello,world');
            done();
          });
        });
      });

      it('should return result sets with different limits.', function(done) {
        api.request('products', { limit: 3 }, function(err, response) {
          expect(response.response.length).to.be.equal(3);

          api.request('products', { limit: 10 }, function(err, response) {
            expect(response.response.length).to.be.equal(10);
            done();
          });
        });
      });

      it('should return result sets from different pages (pagenation).', function(done) {
        // Get a data set to test against.
        api.request('products', { limit: 10 }, function(err, response) {
          var productSet = response.response;

          // Get data subset (page) and compare to the initial data set.
          api.request('products', { limit: 5, page: 1 }, function(err, response) {
            var productsPage1 = response.response;

            api.request('products', { limit: 5, page: 2 }, function(err, response) {
              var productsPage2 = response.response;

              // Check the data set from page 1 with limit 5.
              productsPage1.forEach(function(product, index) {
                expect(product.id).to.be.equal(productSet[index].id);
                expect(product.title).to.be.equal(productSet[index].title);
              });

              // Check the data set from page 2 with limit 5.
              productsPage2.forEach(function(product, index) {
                var index2 = index + productsPage1.length;
                expect(product.id).to.be.equal(productSet[index2].id);
                expect(product.title).to.be.equal(productSet[index2].title);
              });

              done();
            });
          });
        });
      });

      it('should return result sets with specified fields.', function(done) {
        api.request('products', {}, function(err, response) {
          response.response.forEach(function(product) {
            expect(product.id).to.exist;
            expect(product.title).to.exist;
            expect(product.type).to.exist;
            expect(product.status).to.exist;
            expect(product.created).to.exist;
          });

          var options = {
            fields: ['id', 'title'],
          };

          api.request('products', options, function(err, response) {
            response.response.forEach(function(product) {
              expect(product.id).to.exist;
              expect(product.title).to.exist;
              expect(product.type).to.not.exist;
              expect(product.status).to.not.exist;
              expect(product.created).to.not.exist;
            });

            done();
          });
        });
      });
    });

    describe('#education()', function() {
      it('should get an instance of CommonSenseApiEducation.', function() {
        var instance = api.education();
        expect(instance.platform).to.be.equal('education');
        expect(instance.version).to.be.equal(3);
      });
    });

    describe('#media()', function() {
      it('should get an instance of CommonSenseApiMedia.', function() {
        var instance = api.media();
        expect(instance.platform).to.be.equal('media');
        expect(instance.version).to.be.equal(3);
      });
    });

    describe('#getList()', function() {
      it('should get a list of a content type.', function(done) {
        api.getList('products', {}, function(err, response) {
          var products = response.response;
          expect(response.count).to.be.above(0);
          expect(products.length).to.be.above(0);

          products.forEach(function(product) {
            expect(product.id).to.be.a('number');
            expect(product.title).to.exist;
          });

          done();
        });
      });

      it('should take filter options.', function(done) {
        var options = {
          limit: 7,
          fields: ['id', 'title', 'status'],
        };

        api.getList('products', options, function(err, response) {
          var products = response.response;

          expect(products.length).to.be.equal(options.limit);

          products.forEach(function(product) {
            // Iterate through object keys and see if only the ones expected show up.
            for (var key in product) {
              expect(options.fields.indexOf(key)).to.be.above(-1);
            }
          });

          done();
        });
      });
    });

    describe('#getItem()', function() {
      it('should get a single content item.', function(done) {
        // Get a bunch of random products to test with from the getList() call.
        var options = {
          limit: 50,
          page: Math.floor(Math.random() * 10) + 1,
        }

        api.getList('products', options, function(err, response) {
          var products = response.response;

          var ids = [];
          products.forEach(function(product) {
            ids.push(product.id);
          });

          // Get the product item from the API.
          var id = ids[Math.floor(Math.random()*ids.length)]; // get random id from the list.
          api.getItem('products', id, {}, function(err, response) {
            var product = response.response;

            expect(product.id).to.be.a('number');
            expect(product.status).to.be.a('number');
            expect(product.title).to.be.exists;

            done();
          });
        });
      });

      it('should take filter options.', function(done) {
        var fields = ['id', 'title', 'status'];

        // Get a bunch of random products to test with from the getList() call.
        var options = {
          limit: 50,
          page: Math.floor(Math.random() * 10) + 1,
        };

        api.getList('products', options, function(err, response) {
          var products = response.response;

          var ids = [];
          products.forEach(function(product) {
            ids.push(product.id);
          });

          // Get the product item from the API.
          var id = ids[Math.floor(Math.random()*ids.length)]; // get random id from the list.
          api.getItem('products', id, { fields: fields }, function(err, response) {
            var product = response.response;

            // Iterate through object keys and see if only the ones expected show up.
            for (var key in product) {
              expect(fields.indexOf(key)).to.be.above(-1);
            }

            done();
          });
        });
      });
    });
  });
});