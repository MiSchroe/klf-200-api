import { IConnection } from "./connection";
import { GatewayCommand, IGW_FRAME_RCV, GW_COMMON_STATUS } from "./KLF200-API/common";
import { GW_GET_SCENE_LIST_NTF } from "./KLF200-API/GW_GET_SCENE_LIST_NTF";
import { GW_GET_SCENE_LIST_REQ } from "./KLF200-API/GW_GET_SCENE_LIST_REQ";
import { TypedEvent, Listener, Disposable } from "./utils/TypedEvent";
import { GW_SCENE_INFORMATION_CHANGED_NTF, SceneChangeType } from "./KLF200-API/GW_SCENE_INFORMATION_CHANGED_NTF";
import { GW_SESSION_FINISHED_NTF } from "./KLF200-API/GW_SESSION_FINISHED_NTF";
import { GW_ACTIVATE_SCENE_CFM } from "./KLF200-API/GW_ACTIVATE_SCENE_CFM";
import { GW_ACTIVATE_SCENE_REQ } from "./KLF200-API/GW_ACTIVATE_SCENE_REQ";
import { ActivateSceneStatus } from "./KLF200-API/GW_SCENES";
import { GW_GET_SCENE_INFORMATION_NTF, SceneInformationEntry } from "./KLF200-API/GW_GET_SCENE_INFORMATION_NTF";
import { GW_GET_SCENE_INFORMATION_CFM } from "./KLF200-API/GW_GET_SCENE_INFORMATION_CFM";
import { GW_GET_SCENE_INFORMATION_REQ } from "./KLF200-API/GW_GET_SCENE_INFORMATION_REQ";
import { Component } from "./utils/PropertyChangedEvent";
import { GW_STOP_SCENE_CFM } from "./KLF200-API/GW_STOP_SCENE_CFM";
import { GW_STOP_SCENE_REQ } from "./KLF200-API/GW_STOP_SCENE_REQ";
import { GW_GET_SCENE_LIST_CFM } from "./KLF200-API/GW_GET_SCENE_LIST_CFM";

"use strict";

/**
 * The scene object contains the ID, name and a list of products that are contained in the scene.
 * You have methods to start and stop a scene.
 *
 * @export
 * @class Scene
 * @extends {Component}
 */
export class Scene extends Component {
    private _isRunning: boolean = false;
    private _runningSession: number = -1;
    private _sceneName: string;

    /**
     * Contains a list of node IDs with their target values.
     *
     * @type {SceneInformationEntry[]}
     * @memberof Scene
     */
    public readonly Products: SceneInformationEntry[] = [];

    /**
     * Creates an instance of Scene.
     * @param {IConnection} Connection The connection that will be used to send and receive commands.
     * @param {number} SceneID The ID of the scene.
     * @param {string} SceneName The name of the scene.
     * @memberof Scene
     */
    constructor(readonly Connection: IConnection, readonly SceneID: number, SceneName: string) {
        super();

        this._sceneName = SceneName;

        this.Connection.on(frame => this.onNotificationHandler(frame), [GatewayCommand.GW_SESSION_FINISHED_NTF]);
    }

    /**
     * The name of the scene.
     *
     * @readonly
     * @type {string}
     * @memberof Scene
     */
    public get SceneName(): string { return this._sceneName; }

    /**
     * Set to true if the scene is currently running.
     *
     * @readonly
     * @type {boolean}
     * @memberof Scene
     */
    public get IsRunning(): boolean { return this._isRunning; }

    /**
     * Start the scene.
     *
     * @returns {Promise<number>} Returns the session ID. You can listen for the GW_SESSION_FINISHED_NTF notification to determine when the scene has finished.
     * @memberof Scene
     */
    public async runAsync(): Promise<number> {
        try {
            const confirmationFrame = <GW_ACTIVATE_SCENE_CFM> await this.Connection.sendFrameAsync(new GW_ACTIVATE_SCENE_REQ(this.SceneID));
            if (confirmationFrame.Status === ActivateSceneStatus.OK) {
                this._isRunning = true;
                this._runningSession = confirmationFrame.SessionID;
                this.propertyChanged("IsRunning");
                return confirmationFrame.SessionID;
            }
            else {
                return Promise.reject(new Error(confirmationFrame.getError()));
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Stops a running scene.
     *
     * @returns {Promise<number>} Returns the session ID.
     * @memberof Scene
     */
    public async stopAsync(): Promise<number> {
        try {
            const confirmationFrame = <GW_STOP_SCENE_CFM> await this.Connection.sendFrameAsync(new GW_STOP_SCENE_REQ(this.SceneID));
            if (confirmationFrame.Status === ActivateSceneStatus.OK) {
                this._isRunning = false;
                this._runningSession = confirmationFrame.SessionID;
                this.propertyChanged("IsRunning");
                return confirmationFrame.SessionID;
            }
            else {
                return Promise.reject(new Error(confirmationFrame.getError()));
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Refreshes the Products array.
     * 
     * This method is called from the Scenes class if a change notification has been received.
     *
     * @returns {Promise<void>}
     * @memberof Scene
     */
    public async refreshAsync(): Promise<void> {
        // Setup notification to receive notification with actuator type
        let dispose: Disposable | undefined;

        try {
            const tempResult: SceneInformationEntry[] = [];     // Store results temporary until finished without error.
            const notificationHandler = new Promise<void>((resolve, reject) => {
                try {
                    dispose = this.Connection.on(frame => {
                        if (frame instanceof GW_GET_SCENE_INFORMATION_NTF) {
                            tempResult.push(...frame.Nodes);
                            // Check, if last notification message
                            if (frame.NumberOfRemainingNodes === 0) {
                                if (dispose) {
                                    dispose.dispose();
                                }
            
                                // Finished without error -> update Products array
                                this.Products.length = 0;   // Clear array of products
                                this.Products.push(...tempResult);
                                this.propertyChanged("Products");
                                resolve();
                            }
                        }
                    }, [GatewayCommand.GW_GET_SCENE_INFORMATION_NTF]);
                } catch (error) {
                    if (dispose) {
                        dispose.dispose();
                    }
                    reject(error);
                }
            });

            const confirmationFrame = <GW_GET_SCENE_INFORMATION_CFM> await this.Connection.sendFrameAsync(new GW_GET_SCENE_INFORMATION_REQ(this.SceneID));
            if (confirmationFrame.SceneID === this.SceneID) {
                if (confirmationFrame.Status !== GW_COMMON_STATUS.SUCCESS) {
                    if (dispose) {
                        dispose.dispose();
                    }
                    return Promise.reject(new Error(confirmationFrame.getError()));
                }
            }

            // The notifications will resolve the promise
            return notificationHandler;
        } catch (error) {
            if (dispose) {
                dispose.dispose();
            }
            return Promise.reject(error);
        }
    }

    private onNotificationHandler(frame: IGW_FRAME_RCV): void {
        if (frame instanceof GW_SESSION_FINISHED_NTF) {
            this.onSessionFinished(frame);
        }
    }

    private onSessionFinished(frame: GW_SESSION_FINISHED_NTF) {
        if (frame.SessionID === this._runningSession) {
            this._isRunning = false;
            this._runningSession = -1;
            this.propertyChanged("IsRunning");
        }
    }
}

/**
 * Use the scenes object to retrieve a list of scenes known to your KLF interface and to start one of them.
 *
 * @export
 * @class Scenes
 */
export class Scenes {
    private readonly _onChangedScenes = new TypedEvent<number>();
    private readonly _onRemovedScenes = new TypedEvent<number>();

    /**
     * The list of scenes objects that correspond to the scenes defined at the KLF 200 interface.
     * 
     * The array index corresponds to the scene ID.
     *
     * @type {Scene[]}
     * @memberof Scenes
     */
    public readonly Scenes: Scene[] = [];

    private constructor(readonly Connection: IConnection) {}

    /**
     * Creates an instance of Scenes.
     *
     * @static
     * @param {IConnection} Connection The connection that will be used to send and receive commands.
     * @returns {Promise<Scenes>} Returns a new Scenes object that is initialized, already.
     * @memberof Scenes
     */
    static async createScenesAsync(Connection: IConnection): Promise<Scenes> {
        try {
            const result = new Scenes(Connection);
            await result.initializeScenesAsync();
            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private async initializeScenesAsync(): Promise<void> {
        // Setup notification to receive notification with actuator type
        let dispose: Disposable | undefined;

        try {
            const notificationHandlerSceneList = new Promise<void>((resolve, reject) => {
                try {
                    dispose = this.Connection.on(frame => {
                        if (frame instanceof GW_GET_SCENE_LIST_NTF) {
                            frame.Scenes.forEach(scene => this.Scenes[scene.SceneID] = new Scene(this.Connection, scene.SceneID, scene.Name));
                            if (frame.NumberOfRemainingScenes === 0) {
                                if (dispose) {
                                    dispose.dispose();
                                }
                                resolve();
                            }
                        }
                    }, [GatewayCommand.GW_GET_SCENE_LIST_NTF]);
                } catch (error) {
                    if (dispose) {
                        dispose.dispose();
                    }
                    reject(error);
                }
            });
            await this.Connection.sendFrameAsync(new GW_GET_SCENE_LIST_REQ());

            // Wait for GW_GET_SCENE_LIST_NTF
            await notificationHandlerSceneList;

            // Get more detailed information for each scene
            const sceneDetailPromises: Promise<void>[] = [];
            for (const scene of this.Scenes) {
                if (typeof scene !== "undefined") {
                    sceneDetailPromises.push(scene.refreshAsync());
                }
            }
            // Wait for all scene details notifications
            await Promise.all(sceneDetailPromises);

            // Setup notification handler
            this.Connection.on(frame => this.onNotificationHandler(frame), [GatewayCommand.GW_SCENE_INFORMATION_CHANGED_NTF]);

            return Promise.resolve();
        } catch (error) {
            if (dispose) {
                dispose.dispose();
            }
            return Promise.reject(error);
        }
    }

    private onNotificationHandler(frame: IGW_FRAME_RCV): void {
        if (frame instanceof GW_SCENE_INFORMATION_CHANGED_NTF) {
            switch (frame.SceneChangeType) {
                case SceneChangeType.Deleted:
                    delete this.Scenes[frame.SceneID];
                    this.notifyRemovedScene(frame.SceneID);
                    break;

                case SceneChangeType.Modified:
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
    public onChangedScene(handler: Listener<number>): Disposable {
        return this._onChangedScenes.on(handler);
    }

    /**
     * Add an event handler that is called if a scene has been removed.
     *
     * @param {Listener<number>} handler The handler that is called if the event is emitted.
     * @returns {Disposable} Call the dispose method of the returned object to remove the handler.
     * @memberof Scenes
     */
    public onRemovedScene(handler: Listener<number>): Disposable {
        return this._onRemovedScenes.on(handler);
    }

    private notifyChangedScene(sceneId: number): void {
        this._onChangedScenes.emit(sceneId);
    }

    private notifyRemovedScene(sceneId: number): void {
        this._onRemovedScenes.emit(sceneId);
    }

    /**
     * Finds a scene by its name and returns the scene object.
     *
     * @param {string} sceneName The name of the scene.
     * @returns {(Scene | undefined)} Returns the scene object if found, otherwise undefined.
     * @memberof Scenes
     */
    public findByName(sceneName: string): Scene | undefined {
        return this.Scenes.find(sc => typeof sc !== "undefined" && sc.SceneName === sceneName);
    }
}
