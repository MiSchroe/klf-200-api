'use strict';

//const rp = require('request-promise');    // doesn't work, see discussion at https://github.com/request/request/issues/2047
const request = require('superagent');
const Promise = require('bluebird');
const urlBuilder = require('./urlBuilder');

/**
 * Creates a new connection object that connect to the given host.
 * @param {string} host URL of the host name, e.g. http://velux-klf-12ab
 * @constructor
 * @description
 * The connection class is used to handle the communication with the Velux KLF interface.
 * It provides login and logout functionality and provides methods to run other commands
 * on the REST API.
 * @example
 * const connection = require('velux-api').connection;
 *
 * let conn = new connection('http://velux-klf-12ab');
 * conn.loginAsync('velux123')
 *     .then(() => {
 *         ... do some other stuff ...
 *         return conn.logoutAsync();
 *      })
 *     .catch((err) => {    // always close the connection
 *         return conn.logoutAsync().reject(err);
 *      });
 */
function connection(host) {
    this.host = host;
}

/**
 * Logs in to the KLF interface and provides a token for further calls to the REST API.
 * @param {string} password The password needed for login. The factory default password is velux123.
 * @return {Promise} Returns a promise that resolves to true on success or rejects with the errors.
 */
connection.prototype.loginAsync = function (password) {
    if (this.token)
        delete this.token;

    return this.postAsync(urlBuilder.authentication, 'login', { password: password })
        .then((res) => {
            if (res.body.token)
                this.token = res.body.token;
            else
                throw new Error('No login token found');

            return true;
        });
};

/**
 * Logs out from the KLF interface.
 * @return {Promise} Returns a promise that resolves to true on successful logout or rejects with the errors.
 */
connection.prototype.logoutAsync = function () {
    return this.postAsync(urlBuilder.authentication, 'logout').then(() => {
        if (this.token)
            delete this.token;

        return true;
    });
};

/**
 * Calls a REST API function on the KLF interface.
 * @param {string} functionName The name of the function interface, e.g. auth or products.
 *                              You can use {@link urlBuilder} to get the valid function names.
 * @param {string} action The name of the action, e.g. login, logout.
 * @param {object} [params] The parameter data for your action, e.g. the password needed for login.
 * @return {Promise} Returns a promise that resolves to the result of the http request.
 */
connection.prototype.postAsync = function (functionName, action, params = null) {
    try {

        let data = {
            action: action,
            params: params || {}
        };

        let req = request.post(this.host + urlBuilder.getPath(functionName));
        // Add authorization token
        if (this.token) {
            req = req.auth(this.token, { type: 'bearer' });
        }

        return req
            .parse(this.cleanJSONParse)
            .send(data)
            .then((res) => {
                if (!res || !res.body || !res.body.result ||
                    res.body.errors && Array.isArray(res.body.errors) && res.body.errors.length > 0)
                    throw new Error(res.body.errors);
                else
                    return res;
            });

    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 * @callback superAgentParserCallback
 * @param {Error} err
 * @param {any} body
 */

/**
 * Cleans the http-response from invalid characters and returns a JSON object.
 * Is implemented as a parser for {@link superagent}.
 * @internal
 * @param {SuperAgentStatic.response} res The response object.
 * @param {superAgentParserCallback} fn The callback function called by the parser.
 */
connection.prototype.cleanJSONParse = function (res, fn) {
    res.text = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) { res.text += chunk; });
    res.on('end', function () {
        try {
            let responseBody = res.text;
            let startPositionOfJSONObject = responseBody.indexOf('{');
            if (startPositionOfJSONObject > 0)
                responseBody = responseBody.substring(startPositionOfJSONObject);
            fn(null, JSON.parse(responseBody));
        } catch (err) {
            fn(err);
        }
    });
};

module.exports = connection;