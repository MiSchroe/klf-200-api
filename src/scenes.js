'use strict';

const urlBuilder = require('./urlBuilder');

/**
 * Create a new scenes object.
 * Use the scenes object to retrieve a list of scenes known to your KLF interface and to start one of them.
 * @param {connection} connection
 */
function scenes(connection) {
    this.connection = connection;
}

/**
 * Get a list of the scenes stored in the KLF interface.
 * @return {Promise} Returns a promise that resolves to the list of the scenes.
 */
scenes.prototype.getAsync = function () {
    return this.connection.postAsync(urlBuilder.scenes, 'get', null)
        .then((res) => {
            return res.body;
        });
};

/**
 * Runs a scene either by ID or name.
 * @param {(number|string)} sceneId The id or the name of the scene.
 * @return {Promise} Returns a promise that resolves to the result of the API call.
 */
scenes.prototype.runAsync = function (sceneId) {
    if (!sceneId && sceneId !== 0)
        return Promise.reject(new Error('Missing sceneId parameter.'));

    let sceneIdType = typeof sceneId;
    switch (sceneIdType) {
        case 'number':
            return this.connection.postAsync(urlBuilder.scenes, 'run', { id: sceneId })
            .then((res) => {
                return res.body;
            });

        case 'string':
            return this.getAsync()
                .then((scs) => {
                    // Convert scene name to Id
                    let scene = scs.data.find((scene) => {
                        return scene.name === sceneId;
                    });

                    if (!scene || !scene.id && scene.id !== 0)
                        return Promise.reject(new Error(`Scene "${sceneId}" not found`));

                    return this.connection.postAsync(urlBuilder.scenes, 'run', { id: scene.id })
                    .then((res) => {
                        return res.body;
                    });
                });

        default:
            return Promise.reject(new Error('Parameter sceneId must be of type number or string.'));
    }
};

module.exports = scenes;
