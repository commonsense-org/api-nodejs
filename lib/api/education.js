var _s = require('underscore.string');

/**
 * Handles calls to the Common Sense Education API.
 */
function CommonSenseApiEducation(spec) {
  var CommonSenseApi = require('../api');
  var that = new CommonSenseApi(spec);

  that.platform = 'education';
  that.version = 3;
  that.types = [
    'products',
    'blogs',
    'app_flows',
    'lists',
    'user_reviews',
    'boards',
  ];

  /**
   * Dynamically generate a list() call for each type.
   *
   * Example: the function getProductsList() is generated for type: 'products'.
   */
  that.types.forEach(function(type) {
    var typeName = _s.camelize(type).charAt(0).toUpperCase() + _s.camelize(type).slice(1);

    /**
     * Get a list of a given type.
     *
     * @param object
     *   optional parameters for the API call.
     * @param function
     *   the callback function to be called after the async request.
     *   The callback is to take 2 parameters:
     *   - err: an error message if there is a fail.
     *   - response: the JSON response data from the call.
     */
    that['get' + typeName + 'List'] = function(options, callback) {
      that.getList(type, options, function(err, response) {
        callback(err, response);
      });
    }
  });

  /**
   * Dynamically generate an item() call for each type.
   *
   * Example: the function getProductsItem() is generated for type: 'products'.
   */
  that.types.forEach(function(type) {
    var typeName = _s.camelize(type).charAt(0).toUpperCase() + _s.camelize(type).slice(1);

    /**
     * Get a single item of a given type.
     *
     * @param object
     *   optional parameters for the API call.
     * @param function
     *   the callback function to be called after the async request.
     *   The callback is to take 2 parameters:
     *   - err: an error message if there is a fail.
     *   - response: the JSON response data from the call.
     */
    that['get' + typeName + 'Item'] = function(id, options, callback) {
      that.getItem(type, id, options, function(err, response) {
        callback(err, response);
      });
    }
  });

  /**
   * Get a list of taxonomy terms of a specified vocabulary.
   *
   * @param string
   *   a vocabulary ID.
   * @param function
   *   the callback function to be called after the async request.
   *   The callback is to take 2 parameters:
   *   - err: an error message if there is a fail.
   *   - response: the JSON response data from the call.
   */
  that.getTermsList = function(vocabulary, callback) {
    var options = {};

    that.request('terms/' + vocabulary, options, function(err, response) {
      callback(err, response);
    });
  }

  /**
   * Perform a text search on a given type.
   *
   * @param string
   *   the type of data to retrieve (products, blogs, app_flows, lists, user_reviews, boards, users).
   * @param q
   *   the search string.
   * @param array
   *   filter options that the Common Sense API supports.
   * @param function
   *   the callback function to be called after the async request.
   *   The callback is to take 2 parameters:
   *   - err: an error message if there is a fail.
   *   - response: the JSON response data from the call.
   */
  that.search = function(type, q, options, callback) {
    that.request('search/' + type + '/' + q, options, function(err, response) {
      callback(err, response);
    });
  }

  return that;
}

module.exports = CommonSenseApiEducation;