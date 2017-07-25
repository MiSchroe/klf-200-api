'use strict';

const urlBuilder = require('./urlBuilder');


function products(connection) {
    this.connection = connection;
}

products.prototype.getAsync = function () {
    return this.connection.postAsync(urlBuilder.products, 'get', null)
        .then((res) => {
            return res.body;
        });
};

module.exports = products;
