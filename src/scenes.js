'use strict';

const urlBuilder = require('./urlBuilder');


function scenes(connection) {
    this.connection = connection;
}

scenes.prototype.getAsync = function () {
    return this.connection.postAsync(urlBuilder.scenes, 'get', null)
        .then((res) => {
            return res.body;
        });
};

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
