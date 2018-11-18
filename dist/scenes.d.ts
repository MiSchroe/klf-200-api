import { Connection } from "./connection";
import { TypedEvent, Listener, Disposable } from "./utils/TypedEvent";
import { SceneInformationEntry } from "./KLF200-API/GW_GET_SCENE_INFORMATION_NTF";
import { Component } from "./utils/PropertyChangedEvent";
export declare class Scene extends Component {
    readonly Connection: Connection;
    readonly SceneID: number;
    private _isRunning;
    private _runningSession;
    private _sceneName;
    readonly Products: SceneInformationEntry[];
    constructor(Connection: Connection, SceneID: number, SceneName: string);
    readonly SceneName: string;
    readonly IsRunning: boolean;
    runAsync(): Promise<number>;
    stopAsync(): Promise<number>;
    refreshAsync(): Promise<void>;
    private onNotificationHandler;
    private onSessionFinished;
}
export declare class Scenes {
    readonly Connection: Connection;
    _onChangedScenes: TypedEvent<number>;
    _onRemovedScenes: TypedEvent<number>;
    readonly Scenes: (Scene | undefined)[];
    private constructor();
    static createScenesAsync(Connection: Connection): Promise<Scenes>;
    private initializeScenesAsync;
    private onNotificationHandler;
    onChangedScene(handler: Listener<number>): Disposable;
    onRemovedScene(handler: Listener<number>): Disposable;
    private notifyChangedScene;
    private notifyRemovedScene;
}
