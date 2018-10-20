'use strict';

// Defining constants for the KLF-200 REST-API
const API: string = '/api/v1/';

/**
 * Defines the supported functions for the KLF REST-API.
 * @enum {string}
 * @private
 */
enum functionNames {
    /** Use for login and logout */
    authentication = 'auth',
    device = 'device',
    scenes = 'scenes',
    products = 'products'
};

const validFunctionNames: string[] = [];
for (const functionName in functionNames) {
    validFunctionNames.push(functionNames[functionName]);
}
// Object.getOwnPropertyNames(functionNames).forEach((value, index, array) => {
//     validFunctionNames.push(functionNames[value]);
// });

/**
 * Helper functions to build the URL paths.
 */
class urlBuilder {
    /** Use as [functionName]{@link urlBuilder#getPath~functionName} parameter in the [getPath]{@link urlBuilder#getPath} method for login and logout */
    readonly authentication: string = functionNames.authentication;
    
    /** Use for the KLF interface status */
    readonly device: string = functionNames.device;
    
    /** Use for getting or running scenes */
    readonly scenes: string = functionNames.scenes;
    
    /** Use for getting a list of the products */
    readonly products: string = functionNames.products;

    constructor() {}

    /**
    * Returns the path to use in the http.request method.
    * @method
    * @param {functionNames} functionName The function you want to use in your call. Use on of [urlBuilder.authentication]{@link urlBuilder#authentication}, [urlBuilder.device]{@link urlBuilder#device}, [urlBuilder.scenes]{@link urlBuilder#scenes} or [urlBuilder.products]{@link urlBuilder#products}
    * @returns {string} Returns the path to use in the http.request method.
    */
    getPath(functionName: functionNames): string
    {
        if (!functionName)
            throw new RangeError('Parameter \'functionName\' must not be empty.');

        if (!validFunctionNames.some(v => v === functionName.toString()))
            throw new RangeError('Function "' + functionName.toString() + '" not supported.');

        return API + functionName;
    }
}

export default new urlBuilder();
