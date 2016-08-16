/**
 * Utility class
 */
export default class Util {

  /**
   * Creates request configuration based on an url and go config
   * 
   * @param   {string}   url    The url to create configuration for
   * @param   {GoConfig} config Go configuration
   * @param   {boolean}  json   True if expected response is json
   * 
   * @return  {Object}   Request configuration
   */
  static createRequestOptions(url, config, json = false, headers = {}) {
    const options = {
      uri: url,
      rejectUnauthorized: false,
      json: json,
      headers: headers
    };
    if (config.user && config.password) {
      options.auth = {
        user: config.user,
        pass: config.password
      }
    }
    return options;
  }

}
