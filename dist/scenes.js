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
/**
 * The scene object contains the ID, name and a list of products that are contained in the scene.
 * You have methods to start and stop a scene.
 *
 * @export
 * @class Scene
 * @extends {Component}
 */
class Scene extends PropertyChangedEvent_1.Component {
    /**
     *Creates an instance of Scene.
     * @param {Connection} Connection The connection that will be used to send and receive commands.
     * @param {number} SceneID The ID of the scene.
     * @param {string} SceneName The name of the scene.
     * @memberof Scene
     */
    constructor(Connection, SceneID, SceneName) {
        super();
        this.Connection = Connection;
        this.SceneID = SceneID;
        this._isRunning = false;
        this._runningSession = -1;
        /**
         * Contains a list of node IDs with their target values.
         *
         * @type {SceneInformationEntry[]}
         * @memberof Scene
         */
        this.Products = [];
        this._sceneName = SceneName;
        this.Connection.on(frame => this.onNotificationHandler(frame), [common_1.GatewayCommand.GW_SESSION_FINISHED_NTF]);
    }
    /**
     * The name of the scene.
     *
     * @readonly
     * @type {string}
     * @memberof Scene
     */
    get SceneName() { return this._sceneName; }
    /**
     * Set to true if the scene is currently running.
     *
     * @readonly
     * @type {boolean}
     * @memberof Scene
     */
    get IsRunning() { return this._isRunning; }
    /**
     * Start the scene.
     *
     * @returns {Promise<number>} Returns the session ID. You can listen for the GW_SESSION_FINISHED_NTF notification to determine when the scene has finished.
     * @memberof Scene
     */
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
    /**
     * Stops a running scene.
     *
     * @returns {Promise<number>} Returns the session ID.
     * @memberof Scene
     */
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
    /**
     * Refreshes the Products array.
     *
     * This method is called from the Scenes class if a change notification has been received.
     *
     * @returns {Promise<void>}
     * @memberof Scene
     */
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
/**
 * Use the scenes object to retrieve a list of scenes known to your KLF interface and to start one of them.
 *
 * @export
 * @class Scenes
 */
class Scenes {
    constructor(Connection) {
        this.Connection = Connection;
        this._onChangedScenes = new TypedEvent_1.TypedEvent();
        this._onRemovedScenes = new TypedEvent_1.TypedEvent();
        /**
         * The list of scenes objects that correspond to the scenes defined at the KLF 200 interface.
         *
         * The array index corresponds to the scene ID.
         *
         * @type {Scene[]}
         * @memberof Scenes
         */
        this.Scenes = [];
    }
    /**
     * Creates an instance of Scenes.
     *
     * @static
     * @param {Connection} Connection The connection that will be used to send and receive commands.
     * @returns {Promise<Scenes>} Returns a new Scenes object that is initialized, already.
     * @memberof Scenes
     */
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
                    delete this.Scenes[frame.SceneID];
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
    /**
     * Add an event handler that is called if a scene has been changed.
     *
     * @param {Listener<number>} handler The handler that is called if the event is emitted.
     * @returns {Disposable} Call the dispose method of the returned object to remove the handler.
     * @memberof Scenes
     */
    onChangedScene(handler) {
        return this._onChangedScenes.on(handler);
    }
    /**
     * Add an event handler that is called if a scene has been removed.
     *
     * @param {Listener<number>} handler The handler that is called if the event is emitted.
     * @returns {Disposable} Call the dispose method of the returned object to remove the handler.
     * @memberof Scenes
     */
    onRemovedScene(handler) {
        return this._onRemovedScenes.on(handler);
    }
    notifyChangedScene(sceneId) {
        this._onChangedScenes.emit(sceneId);
    }
    notifyRemovedScene(sceneId) {
        this._onRemovedScenes.emit(sceneId);
    }
    /**
     * Finds a scene by its name and returns the scene object.
     *
     * @param {string} sceneName The name of the scene.
     * @returns {(Scene | undefined)} Returns the scene object if found, otherwise undefined.
     * @memberof Scenes
     */
    findByName(sceneName) {
        return this.Scenes.find(sc => typeof sc !== "undefined" && sc.SceneName === sceneName);
    }
}
exports.Scenes = Scenes;
//# sourceMappingURL=scenes.js.map