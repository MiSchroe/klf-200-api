import { IConnection } from "./connection";
import { Listener, Disposable } from "./utils/TypedEvent";
import { SceneInformationEntry } from "./KLF200-API/GW_GET_SCENE_INFORMATION_NTF";
import { Component } from "./utils/PropertyChangedEvent";
/**
 * The scene object contains the ID, name and a list of products that are contained in the scene.
 * You have methods to start and stop a scene.
 *
 * @export
 * @class Scene
 * @extends {Component}
 */
export declare class Scene extends Component {
    readonly Connection: IConnection;
    readonly SceneID: number;
    private _isRunning;
    private _runningSession;
    private _sceneName;
    /**
     * Contains a list of node IDs with their target values.
     *
     * @type {SceneInformationEntry[]}
     * @memberof Scene
     */
    readonly Products: SceneInformationEntry[];
    /**
     * Creates an instance of Scene.
     * @param {IConnection} Connection The connection that will be used to send and receive commands.
     * @param {number} SceneID The ID of the scene.
     * @param {string} SceneName The name of the scene.
     * @memberof Scene
     */
    constructor(Connection: IConnection, SceneID: number, SceneName: string);
    /**
     * The name of the scene.
     *
     * @readonly
     * @type {string}
     * @memberof Scene
     */
    readonly SceneName: string;
    /**
     * Set to true if the scene is currently running.
     *
     * @readonly
     * @type {boolean}
     * @memberof Scene
     */
    readonly IsRunning: boolean;
    /**
     * Start the scene.
     *
     * @returns {Promise<number>} Returns the session ID. You can listen for the GW_SESSION_FINISHED_NTF notification to determine when the scene has finished.
     * @memberof Scene
     */
    runAsync(): Promise<number>;
    /**
     * Stops a running scene.
     *
     * @returns {Promise<number>} Returns the session ID.
     * @memberof Scene
     */
    stopAsync(): Promise<number>;
    /**
     * Refreshes the Products array.
     *
     * This method is called from the Scenes class if a change notification has been received.
     *
     * @returns {Promise<void>}
     * @memberof Scene
     */
    refreshAsync(): Promise<void>;
    private onNotificationHandler;
    private onSessionFinished;
}
/**
 * Use the scenes object to retrieve a list of scenes known to your KLF interface and to start one of them.
 *
 * @export
 * @class Scenes
 */
export declare class Scenes {
    readonly Connection: IConnection;
    private readonly _onChangedScenes;
    private readonly _onRemovedScenes;
    /**
     * The list of scenes objects that correspond to the scenes defined at the KLF 200 interface.
     *
     * The array index corresponds to the scene ID.
     *
     * @type {Scene[]}
     * @memberof Scenes
     */
    readonly Scenes: Scene[];
    private constructor();
    /**
     * Creates an instance of Scenes.
     *
     * @static
     * @param {IConnection} Connection The connection that will be used to send and receive commands.
     * @returns {Promise<Scenes>} Returns a new Scenes object that is initialized, already.
     * @memberof Scenes
     */
    static createScenesAsync(Connection: IConnection): Promise<Scenes>;
    private initializeScenesAsync;
    private onNotificationHandler;
    /**
     * Add an event handler that is called if a scene has been changed.
     *
     * @param {Listener<number>} handler The handler that is called if the event is emitted.
     * @returns {Disposable} Call the dispose method of the returned object to remove the handler.
     * @memberof Scenes
     */
    onChangedScene(handler: Listener<number>): Disposable;
    /**
     * Add an event handler that is called if a scene has been removed.
     *
     * @param {Listener<number>} handler The handler that is called if the event is emitted.
     * @returns {Disposable} Call the dispose method of the returned object to remove the handler.
     * @memberof Scenes
     */
    onRemovedScene(handler: Listener<number>): Disposable;
    private notifyChangedScene;
    private notifyRemovedScene;
    /**
     * Finds a scene by its name and returns the scene object.
     *
     * @param {string} sceneName The name of the scene.
     * @returns {(Scene | undefined)} Returns the scene object if found, otherwise undefined.
     * @memberof Scenes
     */
    findByName(sceneName: string): Scene | undefined;
}
