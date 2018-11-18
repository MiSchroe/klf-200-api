import { Connection } from "./connection";
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

'use strict';

export class Scene extends Component {
    private _isRunning: boolean = false;
    private _runningSession: number = -1;
    private _sceneName: string;
    public readonly Products: SceneInformationEntry[] = [];

    constructor(readonly Connection: Connection, readonly SceneID: number, SceneName: string) {
        super();

        this._sceneName = SceneName;

        this.Connection.on(frame => this.onNotificationHandler(frame), [GatewayCommand.GW_SESSION_FINISHED_NTF]);
    }

    public get SceneName(): string { return this._sceneName; }

    public get IsRunning(): boolean { return this._isRunning; }

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
                return Promise.reject(confirmationFrame.Status);
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

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
                return Promise.reject(confirmationFrame.Status);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public async refreshAsync(): Promise<void> {
        try {
            const tempResult: SceneInformationEntry[] = [];     // Store results temporary until finished without error.
            return new Promise<void>(async (resolve, reject) => {
                const dispose = this.Connection.on(frame => {
                    if (frame instanceof GW_GET_SCENE_INFORMATION_NTF) {
                        tempResult.push(...frame.Nodes);
                        // Check, if last notification message
                        if (frame.NumberOfRemainingNodes === 0) {
                            dispose.dispose();

                            // Finished without error -> update Products array
                            this.Products.length = 0;   // Clear array of products
                            this.Products.push(...tempResult);
                            this.propertyChanged("Products");
                            resolve();
                        }
                    }
                }, [GatewayCommand.GW_GET_SCENE_INFORMATION_NTF]);
                const confirmationFrame = <GW_GET_SCENE_INFORMATION_CFM> await this.Connection.sendFrameAsync(new GW_GET_SCENE_INFORMATION_REQ(this.SceneID));
                if (confirmationFrame.SceneID === this.SceneID) {
                    if (confirmationFrame.Status !== GW_COMMON_STATUS.SUCCESS) {
                        dispose.dispose();
                        reject(confirmationFrame.Status);
                    }
                }
            });
        } catch (error) {
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

export class Scenes {
    public _onChangedScenes = new TypedEvent<number>();
    public _onRemovedScenes = new TypedEvent<number>();

    public readonly Scenes: (Scene | undefined)[] = [];

    private constructor(readonly Connection: Connection) {}

    static async createScenesAsync(Connection: Connection): Promise<Scenes> {
        try {
            const result = new Scenes(Connection);
            await result.initializeScenesAsync();
            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private async initializeScenesAsync(): Promise<void> {
        try {
            return new Promise<void>(async resolve => {
                const dispose = this.Connection.on(async frame => {
                    if (frame instanceof GW_GET_SCENE_LIST_NTF) {
                        frame.Scenes.forEach(scene => this.Scenes[scene.SceneID] = new Scene(this.Connection, scene.SceneID, scene.Name));
                        if (frame.NumberOfRemainingScenes === 0) {
                            dispose.dispose();
                            // Get more detailed information for each scene
                            for (const scene of this.Scenes) {
                                if (typeof scene !== "undefined") {
                                    await scene.refreshAsync();
                                }
                            }
                            this.Connection.on(frame => this.onNotificationHandler(frame), [GatewayCommand.GW_SCENE_INFORMATION_CHANGED_NTF]);
                            resolve();
                        }
                    }
                }, [GatewayCommand.GW_GET_SCENE_LIST_NTF]);
                await this.Connection.sendFrameAsync(new GW_GET_SCENE_LIST_REQ());
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private onNotificationHandler(frame: IGW_FRAME_RCV): void {
        if (frame instanceof GW_SCENE_INFORMATION_CHANGED_NTF) {
            switch (frame.SceneChangeType) {
                case SceneChangeType.Deleted:
                    this.Scenes[frame.SceneID] = undefined;
                    this.notifyRemovedScene(frame.SceneID);
                    break;

                case SceneChangeType.Modified:
                    (this.Scenes[frame.SceneID] as Scene).refreshAsync()
                        .then(() => this.notifyChangedScene(frame.SceneID))
                        .catch(reason => {
                            throw reason;
                        });
            
                default:
                    break;
            }
        }
    }

    public onChangedScene(handler: Listener<number>): Disposable {
        return this._onChangedScenes.on(handler);
    }

    public onRemovedScene(handler: Listener<number>): Disposable {
        return this._onRemovedScenes.on(handler);
    }

    private notifyChangedScene(sceneId: number): void {
        this._onChangedScenes.emit(sceneId);
    }

    private notifyRemovedScene(sceneId: number): void {
        this._onRemovedScenes.emit(sceneId);
    }
}

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
