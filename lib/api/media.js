/**
 * Handles calls to the Common Sense Media API.
 */
function CommonSenseApiMedia(spec) {
  var CommonSenseApi = require('../api');
  var that = new CommonSenseApi(spec);

  that.platform = 'media';
  that.version = 3;

  return that;
}

module.exports = CommonSenseApiMedia;