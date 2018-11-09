'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Defining constants for the KLF-200 REST-API
const API = '/api/v1/';
/**
 * Defines the supported functions for the KLF REST-API.
 * @enum {string}
 * @private
 */
var functionNames;
(function (functionNames) {
    /** Use for login and logout */
    functionNames["authentication"] = "auth";
    functionNames["device"] = "device";
    functionNames["scenes"] = "scenes";
    functionNames["products"] = "products";
})(functionNames || (functionNames = {}));
;
const validFunctionNames = [];
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
    constructor() {
        /** Use as [functionName]{@link urlBuilder#getPath~functionName} parameter in the [getPath]{@link urlBuilder#getPath} method for login and logout */
        this.authentication = functionNames.authentication;
        /** Use for the KLF interface status */
        this.device = functionNames.device;
        /** Use for getting or running scenes */
        this.scenes = functionNames.scenes;
        /** Use for getting a list of the products */
        this.products = functionNames.products;
    }
    /**
    * Returns the path to use in the http.request method.
    * @method
    * @param {functionNames} functionName The function you want to use in your call. Use on of [urlBuilder.authentication]{@link urlBuilder#authentication}, [urlBuilder.device]{@link urlBuilder#device}, [urlBuilder.scenes]{@link urlBuilder#scenes} or [urlBuilder.products]{@link urlBuilder#products}
    * @returns {string} Returns the path to use in the http.request method.
    */
    getPath(functionName) {
        if (!functionName)
            throw new RangeError('Parameter \'functionName\' must not be empty.');
        if (!validFunctionNames.some(v => v === functionName.toString()))
            throw new RangeError('Function "' + functionName.toString() + '" not supported.');
        return API + functionName;
    }
}
exports.default = new urlBuilder();
//# sourceMappingURL=urlBuilder.js.map