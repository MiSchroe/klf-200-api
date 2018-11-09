/**
 * Defines the supported functions for the KLF REST-API.
 * @enum {string}
 * @private
 */
declare enum functionNames {
    /** Use for login and logout */
    authentication = "auth",
    device = "device",
    scenes = "scenes",
    products = "products"
}
/**
 * Helper functions to build the URL paths.
 */
declare class urlBuilder {
    /** Use as [functionName]{@link urlBuilder#getPath~functionName} parameter in the [getPath]{@link urlBuilder#getPath} method for login and logout */
    readonly authentication: string;
    /** Use for the KLF interface status */
    readonly device: string;
    /** Use for getting or running scenes */
    readonly scenes: string;
    /** Use for getting a list of the products */
    readonly products: string;
    constructor();
    /**
    * Returns the path to use in the http.request method.
    * @method
    * @param {functionNames} functionName The function you want to use in your call. Use on of [urlBuilder.authentication]{@link urlBuilder#authentication}, [urlBuilder.device]{@link urlBuilder#device}, [urlBuilder.scenes]{@link urlBuilder#scenes} or [urlBuilder.products]{@link urlBuilder#products}
    * @returns {string} Returns the path to use in the http.request method.
    */
    getPath(functionName: functionNames): string;
}
declare const _default: urlBuilder;
export default _default;
