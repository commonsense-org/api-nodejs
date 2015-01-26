var https = require('https'),
    Querystring = require('querystring'),
    CommonSenseApiMedia = require('./api/media'),
    CommonSenseApiEducation = require('./api/education');

/**
 * Driver for the Common Sense realtime API.
 */
function CommonSenseApi(spec) {
  var that = {};

  that.options = spec;
  that.clientId = spec.clientId;
  that.appId = spec.appId;
  that.version = 3;
  that.platform = 'global';

  // Set API host to call.
  that.host = spec.host;
  if (!spec.host) {
    that.host = 'https://api.commonsense.org';
  }

  /**
   * Make an asynchronous request to the Common Sense API.
   *
   * @param string
   *   the endpoint path of the API call.
   * @param object
   *   optional parameters for the API call.
   * @param function
   *   the callback function to be called after the async request.
   *   The callback is to take 2 parameters:
   *   - err: an error message if there is a fail.
   *   - response: the JSON response data from the call.
   */
  that.request = function(path, options, callback) {
    // Build the API call path.
    var pathPrefix = [
      'v' + that.version,
      that.platform,
      path
    ];

    // Build the default query param.
    that.query = {
      clientId: that.clientId,
      appId: that.appId,
      fields: [],
      limit: 10,
      page: 1,
    };

    // Override default query params.
    if (options.limit) {
      that.query.limit = options.limit;
    }

    if (options.page) {
      that.query.page = options.page;
    }

    if (options.fields) {
      that.query.fields = options.fields.join(',');
    }

    // Set options for the call.
    var httpsOptions = {
      host: that.host,
      path: '/' + pathPrefix.join('/') + '?' + Querystring.stringify(that.query),
    };

    // Build the JSON response.
    var httpsCallback = function(response) {
      var str = '';

      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        callback(null, JSON.parse(str));
      });
    }

    https.request(httpsOptions, httpsCallback).end();
  }

  /**
   * Get an instance of CommonSenseApiEducation.
   *
   * @return CommonSenseApiEducation
   *   an instance of the education API object.
   */
  that.education = function() {
    return CommonSenseApiEducation(spec);
  }

  /**
   * Get an instance of CommonSenseApiMedia.
   *
   * @return CommonSenseApiMedia
   *   an instance of the media API object.
   */
  that.media = function() {
    return CommonSenseApiMedia(spec);
  }

  /**
   * Get a list of data of a given type.
   *
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
  that.getList = function(type, options, callback) {
    that.request(type, options, function(err, response) {
      callback(err, response);
    });
  }

  /**
   * Get a single item of data of a given type and ID.
   *
   * @param string
   *   the type of data to retrieve (products, blogs, app_flows, lists, user_reviews, boards, users).
   * @param id
   *   the system ID of the item.
   * @param array
   *   filter options that the Common Sense API supports.
   * @param function
   *   the callback function to be called after the async request.
   *   The callback is to take 2 parameters:
   *   - err: an error message if there is a fail.
   *   - response: the JSON response data from the call.
   */
  that.getItem = function(type, id, options, callback) {
    that.request(type + '/' + id, options, function(err, response) {
      callback(err, response);
    });
  }

  return that;
}

module.exports = CommonSenseApi;
