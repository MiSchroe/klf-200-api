"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./KLF200-API/common");
const GW_GET_SCENE_LIST_NTF_1 = require("./KLF200-API/GW_GET_SCENE_LIST_NTF");
const GW_GET_SCENE_LIST_REQ_1 = require("./KLF200-API/GW_GET_SCENE_LIST_REQ");
const TypedEvent_1 = require("./utils/TypedEvent");
const GW_SCENE_INFORMATION_CHANGED_NTF_1 = require("./KLF200-API/GW_SCENE_INFORMATION_CHANGED_NTF");
const GW_SESSION_FINISHED_NTF_1 = require("./KLF200-API/GW_SESSION_FINISHED_NTF");
const GW_ACTIVATE_SCENE_REQ_1 = require("./KLF200-API/GW_ACTIVATE_SCENE_REQ");
const GW_SCENES_1 = require("./KLF200-API/GW_SCENES");
const GW_GET_SCENE_INFORMATION_NTF_1 = require("./KLF200-API/GW_GET_SCENE_INFORMATION_NTF");
const GW_GET_SCENE_INFORMATION_REQ_1 = require("./KLF200-API/GW_GET_SCENE_INFORMATION_REQ");
const PropertyChangedEvent_1 = require("./utils/PropertyChangedEvent");
const GW_STOP_SCENE_REQ_1 = require("./KLF200-API/GW_STOP_SCENE_REQ");
'use strict';
class Scene extends PropertyChangedEvent_1.Component {
    constructor(Connection, SceneID, SceneName) {
        super();
        this.Connection = Connection;
        this.SceneID = SceneID;
        this._isRunning = false;
        this._runningSession = -1;
        this.Products = [];
        this._sceneName = SceneName;
        this.Connection.on(frame => this.onNotificationHandler(frame), [common_1.GatewayCommand.GW_SESSION_FINISHED_NTF]);
    }
    get SceneName() { return this._sceneName; }
    get IsRunning() { return this._isRunning; }
    runAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const confirmationFrame = yield this.Connection.sendFrameAsync(new GW_ACTIVATE_SCENE_REQ_1.GW_ACTIVATE_SCENE_REQ(this.SceneID));
                if (confirmationFrame.Status === GW_SCENES_1.ActivateSceneStatus.OK) {
                    this._isRunning = true;
                    this._runningSession = confirmationFrame.SessionID;
                    this.propertyChanged("IsRunning");
                    return confirmationFrame.SessionID;
                }
                else {
                    return Promise.reject(confirmationFrame.Status);
                }
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    stopAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const confirmationFrame = yield this.Connection.sendFrameAsync(new GW_STOP_SCENE_REQ_1.GW_STOP_SCENE_REQ(this.SceneID));
                if (confirmationFrame.Status === GW_SCENES_1.ActivateSceneStatus.OK) {
                    this._isRunning = false;
                    this._runningSession = confirmationFrame.SessionID;
                    this.propertyChanged("IsRunning");
                    return confirmationFrame.SessionID;
                }
                else {
                    return Promise.reject(confirmationFrame.Status);
                }
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    refreshAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tempResult = []; // Store results temporary until finished without error.
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    const dispose = this.Connection.on(frame => {
                        if (frame instanceof GW_GET_SCENE_INFORMATION_NTF_1.GW_GET_SCENE_INFORMATION_NTF) {
                            tempResult.push(...frame.Nodes);
                            // Check, if last notification message
                            if (frame.NumberOfRemainingNodes === 0) {
                                dispose.dispose();
                                // Finished without error -> update Products array
                                this.Products.length = 0; // Clear array of products
                                this.Products.push(...tempResult);
                                this.propertyChanged("Products");
                                resolve();
                            }
                        }
                    }, [common_1.GatewayCommand.GW_GET_SCENE_INFORMATION_NTF]);
                    const confirmationFrame = yield this.Connection.sendFrameAsync(new GW_GET_SCENE_INFORMATION_REQ_1.GW_GET_SCENE_INFORMATION_REQ(this.SceneID));
                    if (confirmationFrame.SceneID === this.SceneID) {
                        if (confirmationFrame.Status !== common_1.GW_COMMON_STATUS.SUCCESS) {
                            dispose.dispose();
                            reject(confirmationFrame.Status);
                        }
                    }
                }));
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    onNotificationHandler(frame) {
        if (frame instanceof GW_SESSION_FINISHED_NTF_1.GW_SESSION_FINISHED_NTF) {
            this.onSessionFinished(frame);
        }
    }
    onSessionFinished(frame) {
        if (frame.SessionID === this._runningSession) {
            this._isRunning = false;
            this._runningSession = -1;
            this.propertyChanged("IsRunning");
        }
    }
}
exports.Scene = Scene;
class Scenes {
    constructor(Connection) {
        this.Connection = Connection;
        this._onChangedScenes = new TypedEvent_1.TypedEvent();
        this._onRemovedScenes = new TypedEvent_1.TypedEvent();
        this.Scenes = [];
    }
    static createScenesAsync(Connection) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = new Scenes(Connection);
                yield result.initializeScenesAsync();
                return result;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    initializeScenesAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    const dispose = this.Connection.on((frame) => __awaiter(this, void 0, void 0, function* () {
                        if (frame instanceof GW_GET_SCENE_LIST_NTF_1.GW_GET_SCENE_LIST_NTF) {
                            frame.Scenes.forEach(scene => this.Scenes[scene.SceneID] = new Scene(this.Connection, scene.SceneID, scene.Name));
                            if (frame.NumberOfRemainingScenes === 0) {
                                dispose.dispose();
                                // Get more detailed information for each scene
                                for (const scene of this.Scenes) {
                                    if (typeof scene !== "undefined") {
                                        yield scene.refreshAsync();
                                    }
                                }
                                this.Connection.on(frame => this.onNotificationHandler(frame), [common_1.GatewayCommand.GW_SCENE_INFORMATION_CHANGED_NTF]);
                                resolve();
                            }
                        }
                    }), [common_1.GatewayCommand.GW_GET_SCENE_LIST_NTF]);
                    yield this.Connection.sendFrameAsync(new GW_GET_SCENE_LIST_REQ_1.GW_GET_SCENE_LIST_REQ());
                }));
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    onNotificationHandler(frame) {
        if (frame instanceof GW_SCENE_INFORMATION_CHANGED_NTF_1.GW_SCENE_INFORMATION_CHANGED_NTF) {
            switch (frame.SceneChangeType) {
                case GW_SCENE_INFORMATION_CHANGED_NTF_1.SceneChangeType.Deleted:
                    this.Scenes[frame.SceneID] = undefined;
                    this.notifyRemovedScene(frame.SceneID);
                    break;
                case GW_SCENE_INFORMATION_CHANGED_NTF_1.SceneChangeType.Modified:
                    this.Scenes[frame.SceneID].refreshAsync()
                        .then(() => this.notifyChangedScene(frame.SceneID))
                        .catch(reason => {
                        throw reason;
                    });
                default:
                    break;
            }
        }
    }
    onChangedScene(handler) {
        return this._onChangedScenes.on(handler);
    }
    onRemovedScene(handler) {
        return this._onRemovedScenes.on(handler);
    }
    notifyChangedScene(sceneId) {
        this._onChangedScenes.emit(sceneId);
    }
    notifyRemovedScene(sceneId) {
        this._onRemovedScenes.emit(sceneId);
    }
}
exports.Scenes = Scenes;
// /**
//  * Create a new scenes object.
//  * Use the scenes object to retrieve a list of scenes known to your KLF interface and to start one of them.
//  * @constructor
//  * @param {connection} connection
//  */
// function scenes(connection) {
//     this.connection = connection;
// }
// /**
//  * Get a list of the scenes stored in the KLF interface.
//  * @return {Promise} Returns a promise that resolves to the list of the scenes.
//  */
// scenes.prototype.getAsync = function () {
//     return this.connection.postAsync(urlBuilder.scenes, 'get', null)
//         .then((res) => {
//             return res.data;
//         });
// };
// /**
//  * Runs a scene either by ID or name.
//  * @param {(number|string)} sceneIdOrName The id or the name of the scene.
//  * @return {Promise} Returns a promise that resolves.
//  */
// scenes.prototype.runAsync = function (sceneIdOrName) {
//     if (!sceneIdOrName && sceneIdOrName !== 0)
//         return Promise.reject(new Error('Missing sceneId parameter.'));
//     let sceneIdType = typeof sceneIdOrName;
//     switch (sceneIdType) {
//         case 'number':
//             return this.connection.postAsync(urlBuilder.scenes, 'run', { id: sceneIdOrName })
//             .then(() => {
//                 return Promise.resolve();
//             });
//         case 'string':
//             return this.getAsync()
//                 .then((scs) => {
//                     // Convert scene name to Id
//                     let scene = scs.find((scene) => {
//                         return scene.name === sceneIdOrName;
//                     });
//                     if (!scene || !scene.id && scene.id !== 0)
//                         return Promise.reject(new Error(`Scene "${sceneIdOrName}" not found`));
//                     return this.connection.postAsync(urlBuilder.scenes, 'run', { id: scene.id })
//                     .then(() => {
//                         return Promise.resolve();
//                     });
//                 });
//         default:
//             return Promise.reject(new Error('Parameter sceneId must be of type number or string.'));
//     }
// };
// module.exports = scenes;
//# sourceMappingURL=scenes.js.map