"use strict";

import debugModule from "debug";
import "disposablestack/auto";
import { timeout as promiseTimeout } from "promise-timeout";
import { GW_ACTIVATE_SCENE_REQ } from "./KLF200-API/GW_ACTIVATE_SCENE_REQ.js";
import { CommandOriginator, PriorityLevel } from "./KLF200-API/GW_COMMAND.js";
import { GW_GET_SCENE_INFORMATION_NTF, SceneInformationEntry } from "./KLF200-API/GW_GET_SCENE_INFORMATION_NTF.js";
import { GW_GET_SCENE_INFORMATION_REQ } from "./KLF200-API/GW_GET_SCENE_INFORMATION_REQ.js";
import { GW_GET_SCENE_LIST_NTF } from "./KLF200-API/GW_GET_SCENE_LIST_NTF.js";
import { GW_GET_SCENE_LIST_REQ } from "./KLF200-API/GW_GET_SCENE_LIST_REQ.js";
import { ActivateSceneStatus } from "./KLF200-API/GW_SCENES.js";
import { GW_SCENE_INFORMATION_CHANGED_NTF, SceneChangeType } from "./KLF200-API/GW_SCENE_INFORMATION_CHANGED_NTF.js";
import { GW_SESSION_FINISHED_NTF } from "./KLF200-API/GW_SESSION_FINISHED_NTF.js";
import { GW_STOP_SCENE_REQ } from "./KLF200-API/GW_STOP_SCENE_REQ.js";
import { Velocity } from "./KLF200-API/GW_SYSTEMTABLE_DATA.js";
import { GW_COMMON_STATUS, GatewayCommand, IGW_FRAME_RCV } from "./KLF200-API/common.js";
import { IConnection } from "./connection.js";
import { Component } from "./utils/PropertyChangedEvent.js";
import { Listener, TypedEvent } from "./utils/TypedEvent.js";

const debug = debugModule(`klf-200-api:scenes`);

/**
 * The scene object contains the ID, name and a list of products that are contained in the scene.
 * You have methods to start and stop a scene.
 *
 * @class Scene
 */
export class Scene extends Component {
	private _isRunning: boolean = false;
	private _runningSession: number = -1;
	private _sceneName: string;

	/**
	 * Contains a list of node IDs with their target values.
	 *
	 * @type {SceneInformationEntry[]}
	 */
	public readonly Products: SceneInformationEntry[] = [];

	private _disposables = new DisposableStack();

	/**
	 * Creates an instance of Scene.
	 * @param {IConnection} Connection The connection that will be used to send and receive commands.
	 * @param {number} SceneID The ID of the scene.
	 * @param {string} SceneName The name of the scene.
	 */
	constructor(
		readonly Connection: IConnection,
		readonly SceneID: number,
		SceneName: string,
	) {
		debug(`Creating Scene with SceneID: ${SceneID} and SceneName: ${SceneName}`);
		super();

		this._sceneName = SceneName;

		this._disposables.use(
			this.Connection.on(
				async (frame) => {
					debug(
						`Calling onNotificationHandler for GW_SESSION_FINISHED_NTF added in Scene constructor for SceneID: ${this.SceneID}.`,
					);
					await this.onNotificationHandler(frame);
				},
				[GatewayCommand.GW_SESSION_FINISHED_NTF],
			),
		);
	}

	public [Symbol.dispose](): void {
		debug(`Disposing Scene with SceneID: ${this.SceneID}`);
		this._disposables.dispose();
		super[Symbol.dispose]();
		debug(`Disposed Scene with SceneID: ${this.SceneID}`);
	}

	/**
	 * The name of the scene.
	 *
	 * @readonly
	 * @type {string}
	 */
	public get SceneName(): string {
		return this._sceneName;
	}

	/**
	 * Set to true if the scene is currently running.
	 *
	 * @readonly
	 * @type {boolean}
	 */
	public get IsRunning(): boolean {
		return this._isRunning;
	}

	/**
	 * Start the scene.
	 *
	 * @param Velocity The velocity with which the scene will be run.
	 * @param PriorityLevel The priority level for the run command.
	 * @param CommandOriginator The command originator for the run command.
	 * @returns {Promise<number>} Returns the session ID. You can listen for the GW_SESSION_FINISHED_NTF notification to determine when the scene has finished.
	 */
	public async runAsync(
		Velocity: Velocity = 0,
		PriorityLevel: PriorityLevel = 3,
		CommandOriginator: CommandOriginator = 1,
	): Promise<number> {
		debug(`Running scene with SceneID: ${this.SceneID}`);
		const confirmationFrame = await this.Connection.sendFrameAsync(
			new GW_ACTIVATE_SCENE_REQ(this.SceneID, PriorityLevel, CommandOriginator, Velocity),
		);
		if (confirmationFrame.Status === ActivateSceneStatus.OK) {
			this._isRunning = true;
			this._runningSession = confirmationFrame.SessionID;
			await this.propertyChanged("IsRunning");
			return confirmationFrame.SessionID;
		} else {
			debug(`Error running scene with SceneID: ${this.SceneID}`);
			return Promise.reject(new Error(confirmationFrame.getError()));
		}
	}

	/**
	 * Stops a running scene.
	 *
	 * @param PriorityLevel The priority level for the run command.
	 * @param CommandOriginator The command originator for the run command.
	 * @returns {Promise<number>} Returns the session ID.
	 */
	public async stopAsync(
		PriorityLevel: PriorityLevel = 3,
		CommandOriginator: CommandOriginator = 1,
	): Promise<number> {
		debug(`Stopping scene with SceneID: ${this.SceneID}`);
		const confirmationFrame = await this.Connection.sendFrameAsync(
			new GW_STOP_SCENE_REQ(this.SceneID, PriorityLevel, CommandOriginator),
		);
		if (confirmationFrame.Status === ActivateSceneStatus.OK) {
			this._isRunning = false;
			this._runningSession = confirmationFrame.SessionID;
			await this.propertyChanged("IsRunning");
			return confirmationFrame.SessionID;
		} else {
			debug(`Error stopping scene with SceneID: ${this.SceneID}`);
			return Promise.reject(new Error(confirmationFrame.getError()));
		}
	}

	/**
	 * Refreshes the Products array.
	 *
	 * This method is called from the Scenes class if a change notification has been received.
	 *
	 * @returns {Promise<void>}
	 */
	public async refreshAsync(): Promise<void> {
		debug(`Refreshing scene with SceneID: ${this.SceneID}`);
		// Setup notification to receive notification with actuator type

		const tempResult: SceneInformationEntry[] = []; // Store results temporary until finished without error.
		// Setup the event handlers first to prevent a race condition
		// where we don't see the events.
		let resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void;
		const notificationHandler = new Promise<void>((res, rej) => {
			resolve = res;
			reject = rej;
		});
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		using dispose = this.Connection.on(
			async (frame) => {
				try {
					debug(`Calling handler for GW_GET_SCENE_INFORMATION_NTF in Scene.refreshAsync.`);
					if (frame instanceof GW_GET_SCENE_INFORMATION_NTF) {
						tempResult.push(...frame.Nodes);
						// Check, if last notification message
						if (frame.NumberOfRemainingNodes === 0) {
							// Finished without error -> update Products array
							this.Products.length = 0; // Clear array of products
							this.Products.push(...tempResult);
							await this.propertyChanged("Products");

							// It seems that currently the notification frame doesn't return the scene name.
							// Though we only change it if it's not empty and different.
							if (frame.Name !== this._sceneName && frame.Name !== "") {
								this._sceneName = frame.Name;
								await this.propertyChanged("SceneName");
							}
							resolve();
						}
					}
				} catch (error) {
					debug(`Error refreshing scene with SceneID: ${this.SceneID}`);
					reject(error);
				}
			},
			[GatewayCommand.GW_GET_SCENE_INFORMATION_NTF],
		);

		const confirmationFrame = await this.Connection.sendFrameAsync(new GW_GET_SCENE_INFORMATION_REQ(this.SceneID));
		if (confirmationFrame.SceneID === this.SceneID) {
			if (confirmationFrame.Status !== GW_COMMON_STATUS.SUCCESS) {
				debug(`Error refreshing scene with SceneID: ${this.SceneID}`);
				return Promise.reject(new Error(confirmationFrame.getError()));
			}
		}

		// The notifications will resolve the promise
		await notificationHandler;
	}

	private async onNotificationHandler(frame: IGW_FRAME_RCV): Promise<void> {
		debug(
			`Calling handler for GW_SESSION_FINISHED_NTF in Scene.onNotificationHandler with frame: ${JSON.stringify(frame)}.`,
		);
		if (frame instanceof GW_SESSION_FINISHED_NTF) {
			await this.onSessionFinished(frame);
		}
	}

	private async onSessionFinished(frame: GW_SESSION_FINISHED_NTF): Promise<void> {
		debug(
			`Calling handler for GW_SESSION_FINISHED_NTF in Scene.onSessionFinished with frame: ${JSON.stringify(frame)}.`,
		);
		if (frame.SessionID === this._runningSession) {
			this._isRunning = false;
			this._runningSession = -1;
			await this.propertyChanged("IsRunning");
		}
	}
}

/**
 * Use the scenes object to retrieve a list of scenes known to your KLF interface and to start one of them.
 *
 * @class Scenes
 */
export class Scenes implements Disposable {
	private readonly _onChangedScenes = new TypedEvent<number>();
	private readonly _onRemovedScenes = new TypedEvent<number>();
	private readonly _onAddedScenes = new TypedEvent<number>();

	/**
	 * The list of scenes objects that correspond to the scenes defined at the KLF 200 interface.
	 *
	 * The array index corresponds to the scene ID.
	 *
	 * @type {Scene[]}
	 */
	public readonly Scenes: Scene[] = [];

	private _disposables = new DisposableStack();

	private constructor(readonly Connection: IConnection) {}

	public [Symbol.dispose](): void {
		debug("Disposing Scenes.");
		this.Scenes.forEach((scene) => {
			if (scene) {
				scene[Symbol.dispose]();
			}
		});
		this.Scenes.length = 0;
		this._disposables.dispose();
		this._onChangedScenes.removeAllListeners();
		this._onRemovedScenes.removeAllListeners();
		this._onAddedScenes.removeAllListeners();
		this._notificationHandler = undefined;
		debug("Disposed Scenes.");
	}

	/**
	 * Creates an instance of Scenes.
	 *
	 * @param {IConnection} Connection The connection that will be used to send and receive commands.
	 * @returns {Promise<Scenes>} Returns a new Scenes object that is initialized, already.
	 */
	static async createScenesAsync(Connection: IConnection): Promise<Scenes> {
		debug("Creating Scenes.");
		const result = new Scenes(Connection);
		await result.refreshScenesAsync();
		return result;
	}

	private _notificationHandler: Disposable | undefined;

	public async refreshScenesAsync(): Promise<void> {
		debug("Refreshing scenes.");
		// Setup notification to receive notification with actuator type
		const newScenes: Scene[] = [];

		// Setup the event handlers first to prevent a race condition
		// where we don't see the events.
		let resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void;
		const notificationHandlerSceneList = new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		});

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		using dispose = this.Connection.on(
			(frame) => {
				try {
					debug(`Calling handler for GW_GET_SCENE_LIST_NTF in Scenes.refreshScenesAsync.`);
					if (frame instanceof GW_GET_SCENE_LIST_NTF) {
						frame.Scenes.forEach((scene) => {
							if (typeof this.Scenes[scene.SceneID] === "undefined") {
								const newScene = new Scene(this.Connection, scene.SceneID, scene.Name);
								this.Scenes[scene.SceneID] = newScene;
								newScenes.push(newScene);
							}
						});
						if (frame.NumberOfRemainingScenes === 0) {
							resolve();
						}
					}
				} catch (error) {
					debug("Error refreshing scenes.");
					reject(error);
				}
			},
			[GatewayCommand.GW_GET_SCENE_LIST_NTF],
		);

		const getSceneListConfirmation = await this.Connection.sendFrameAsync(new GW_GET_SCENE_LIST_REQ());

		// Wait for GW_GET_SCENE_LIST_NTF, but only if there are scenes defined
		if (getSceneListConfirmation.NumberOfScenes > 0) {
			debug("Waiting for scenes.");
			await promiseTimeout(notificationHandlerSceneList, 600000); // 10 minutes
		}

		// Get more detailed information for each scene
		for (const scene of this.Scenes) {
			if (typeof scene !== "undefined") {
				await scene.refreshAsync();
			}
		}

		// Notify about added scenes
		for (const scene of newScenes) {
			await this.notifyAddedScene(scene.SceneID);
		}

		// Setup notification handler
		if (typeof this._notificationHandler === "undefined") {
			this._notificationHandler = this.Connection.on(
				async (frame) => {
					debug(
						`Calling onNotificationHandler for GW_SCENE_INFORMATION_CHANGED_NTF in Scenes.refreshSCenesAsync.`,
					);
					await this.onNotificationHandler(frame);
				},
				[GatewayCommand.GW_SCENE_INFORMATION_CHANGED_NTF],
			);
			this._disposables.use(this._notificationHandler);
		}

		return Promise.resolve();
	}

	private async onNotificationHandler(frame: IGW_FRAME_RCV): Promise<void> {
		debug(
			`Calling handler for GW_SCENE_INFORMATION_CHANGED_NTF in onNotificationHandler with frame: ${JSON.stringify(frame)}.`,
		);
		if (frame instanceof GW_SCENE_INFORMATION_CHANGED_NTF) {
			switch (frame.SceneChangeType) {
				case SceneChangeType.Deleted:
					if (this.Scenes[frame.SceneID]) {
						this.Scenes[frame.SceneID][Symbol.dispose]();
					}
					delete this.Scenes[frame.SceneID];
					await this.notifyRemovedScene(frame.SceneID);
					break;

				case SceneChangeType.Modified:
					await this.Scenes[frame.SceneID].refreshAsync();
					await this.notifyChangedScene(frame.SceneID);
					break;

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
	 */
	public onChangedScene(handler: Listener<number>): Disposable {
		debug("Adding handler for onChangedScene.");
		return this._onChangedScenes.on(handler);
	}

	/**
	 * Add an event handler that is called if a scene has been removed.
	 *
	 * @param {Listener<number>} handler The handler that is called if the event is emitted.
	 * @returns {Disposable} Call the dispose method of the returned object to remove the handler.
	 */
	public onRemovedScene(handler: Listener<number>): Disposable {
		debug("Adding handler for onRemovedScene.");
		return this._onRemovedScenes.on(handler);
	}

	/**
	 * Add an event handler that is called if a scene has been added.
	 *
	 * @param {Listener<number>} handler The handler that is called if the event is emitted.
	 * @returns {Disposable} Call the dispose method of the returned object to remove the handler.
	 */
	public onAddedScene(handler: Listener<number>): Disposable {
		debug("Adding handler for onAddedScene.");
		return this._onAddedScenes.on(handler);
	}

	private async notifyChangedScene(sceneId: number): Promise<void> {
		debug(`Calling handler for onChangedScene with sceneId: ${sceneId}.`);
		await this._onChangedScenes.emit(sceneId);
	}

	private async notifyRemovedScene(sceneId: number): Promise<void> {
		debug(`Calling handler for onRemovedScene with sceneId: ${sceneId}.`);
		await this._onRemovedScenes.emit(sceneId);
	}

	private async notifyAddedScene(sceneId: number): Promise<void> {
		debug(`Calling handler for onAddedScene with sceneId: ${sceneId}.`);
		await this._onAddedScenes.emit(sceneId);
	}

	/**
	 * Finds a scene by its name and returns the scene object.
	 *
	 * @param {string} sceneName The name of the scene.
	 * @returns {(Scene | undefined)} Returns the scene object if found, otherwise undefined.
	 */
	public findByName(sceneName: string): Scene | undefined {
		debug(`Calling findByName with sceneName: ${sceneName}.`);
		return this.Scenes.find((sc) => typeof sc !== "undefined" && sc.SceneName === sceneName);
	}
}
