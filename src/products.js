'use strict';

const urlBuilder = require('./urlBuilder');

/**
 * Create a new products object.
 * Use the products object to retrieve a list of products known to your KLF interface.
 * @param {connection} connection The connection object that handles the communication to the KLF interface.
 */
function products(connection) {
    this.connection = connection;
}

/**
 * Gets a list of your products.
 * @return {Promise} Returns a promise that resolves to the products list.
 */
products.prototype.getAsync = function () {
    return this.connection.postAsync(urlBuilder.products, 'get', null)
        .then((res) => {
            return res.body;
        });
};

module.exports = products;
