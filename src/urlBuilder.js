'use strict';

const URL = require('url');

// Defining constants for the Velux(tm) REST-API
const API = '/api/v1/';

/**
 * Defines the supported functions for the Velux(tm) REST-API.
 * @enum {string}
 */
const functionNames = {
    /** Use for login and logout */
    authentication: 'auth',
    devices: 'device',
    scenes: 'scenes',
    products: 'products'
};

const validFunctionNames = [];
Object.getOwnPropertyNames(functionNames).forEach((value, index, array) => {
    validFunctionNames.push(functionNames[value]);
});

/**
 * Helper functions to build the URL paths.
 * @constructor
 */
function urlBuilder() { }

urlBuilder.prototype.authentication = functionNames.authentication;
urlBuilder.prototype.devices = functionNames.devices;
urlBuilder.prototype.scenes = functionNames.scenes;
urlBuilder.prototype.products = functionNames.products;

//urlBuilder.prototype.getAPIUrl = function (host, functionName) {
//    if (!host)
//        throw new RangeError('Parameter \'host\' must not be empty.');

//    if (!functionName)
//        throw new RangeError('Parameter \'functionName\' must not be empty.');

//    let url = URL.parse(host);
//    url.pathname = API + functionName;
//    return URL;
//}

/**
* Returns the path to use in the http.request method.
* @method
* @param {functionNames} functionName The function you want to use in your call.
* @returns {string} Returns the path to use in the http.request method.
*/
urlBuilder.prototype.getPath = function (functionName) {
    if (!functionName)
        throw new RangeError('Parameter \'functionName\' must not be empty.');

    if (!validFunctionNames.some((value) => { return value === functionName; }))
        throw new RangeError('Function "' + functionName.toString() + '" not supported.');

    return API + functionName;
};

module.exports = new urlBuilder();
