import { GW_ACTIVATE_SCENE_CFM } from "./KLF200-API/GW_ACTIVATE_SCENE_CFM";
import { GW_ACTIVATE_SCENE_REQ } from "./KLF200-API/GW_ACTIVATE_SCENE_REQ";
import { CommandOriginator, PriorityLevel } from "./KLF200-API/GW_COMMAND";
import { GW_GET_SCENE_INFORMATION_CFM } from "./KLF200-API/GW_GET_SCENE_INFORMATION_CFM";
import { GW_GET_SCENE_INFORMATION_NTF, SceneInformationEntry } from "./KLF200-API/GW_GET_SCENE_INFORMATION_NTF";
import { GW_GET_SCENE_INFORMATION_REQ } from "./KLF200-API/GW_GET_SCENE_INFORMATION_REQ";
import { GW_GET_SCENE_LIST_CFM } from "./KLF200-API/GW_GET_SCENE_LIST_CFM";
import { GW_GET_SCENE_LIST_NTF } from "./KLF200-API/GW_GET_SCENE_LIST_NTF";
import { GW_GET_SCENE_LIST_REQ } from "./KLF200-API/GW_GET_SCENE_LIST_REQ";
import { ActivateSceneStatus } from "./KLF200-API/GW_SCENES";
import { GW_SCENE_INFORMATION_CHANGED_NTF, SceneChangeType } from "./KLF200-API/GW_SCENE_INFORMATION_CHANGED_NTF";
import { GW_SESSION_FINISHED_NTF } from "./KLF200-API/GW_SESSION_FINISHED_NTF";
import { GW_STOP_SCENE_CFM } from "./KLF200-API/GW_STOP_SCENE_CFM";
import { GW_STOP_SCENE_REQ } from "./KLF200-API/GW_STOP_SCENE_REQ";
import { Velocity } from "./KLF200-API/GW_SYSTEMTABLE_DATA";
import { GW_COMMON_STATUS, GatewayCommand, IGW_FRAME_RCV } from "./KLF200-API/common";
import { IConnection } from "./connection";
import { Component } from "./utils/PropertyChangedEvent";
import { Disposable, Listener, TypedEvent } from "./utils/TypedEvent";

("use strict");

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
	constructor(
		readonly Connection: IConnection,
		readonly SceneID: number,
		SceneName: string,
	) {
		super();

		this._sceneName = SceneName;

		this.Connection.on((frame) => this.onNotificationHandler(frame), [GatewayCommand.GW_SESSION_FINISHED_NTF]);
	}

	/**
	 * The name of the scene.
	 *
	 * @readonly
	 * @type {string}
	 * @memberof Scene
	 */
	public get SceneName(): string {
		return this._sceneName;
	}

	/**
	 * Set to true if the scene is currently running.
	 *
	 * @readonly
	 * @type {boolean}
	 * @memberof Scene
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
	 * @memberof Scene
	 */
	public async runAsync(
		Velocity: Velocity = 0,
		PriorityLevel: PriorityLevel = 3,
		CommandOriginator: CommandOriginator = 1,
	): Promise<number> {
		try {
			const confirmationFrame = <GW_ACTIVATE_SCENE_CFM>(
				await this.Connection.sendFrameAsync(
					new GW_ACTIVATE_SCENE_REQ(this.SceneID, PriorityLevel, CommandOriginator, Velocity),
				)
			);
			if (confirmationFrame.Status === ActivateSceneStatus.OK) {
				this._isRunning = true;
				this._runningSession = confirmationFrame.SessionID;
				await this.propertyChanged("IsRunning");
				return confirmationFrame.SessionID;
			} else {
				return Promise.reject(new Error(confirmationFrame.getError()));
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * Stops a running scene.
	 *
	 * @param PriorityLevel The priority level for the run command.
	 * @param CommandOriginator The command originator for the run command.
	 * @returns {Promise<number>} Returns the session ID.
	 * @memberof Scene
	 */
	public async stopAsync(
		PriorityLevel: PriorityLevel = 3,
		CommandOriginator: CommandOriginator = 1,
	): Promise<number> {
		try {
			const confirmationFrame = <GW_STOP_SCENE_CFM>(
				await this.Connection.sendFrameAsync(
					new GW_STOP_SCENE_REQ(this.SceneID, PriorityLevel, CommandOriginator),
				)
			);
			if (confirmationFrame.Status === ActivateSceneStatus.OK) {
				this._isRunning = false;
				this._runningSession = confirmationFrame.SessionID;
				await this.propertyChanged("IsRunning");
				return confirmationFrame.SessionID;
			} else {
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
			const tempResult: SceneInformationEntry[] = []; // Store results temporary until finished without error.
			const notificationHandler = new Promise<void>((resolve, reject) => {
				try {
					dispose = this.Connection.on(
						async (frame) => {
							if (frame instanceof GW_GET_SCENE_INFORMATION_NTF) {
								tempResult.push(...frame.Nodes);
								// Check, if last notification message
								if (frame.NumberOfRemainingNodes === 0) {
									if (dispose) {
										dispose.dispose();
									}

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
						},
						[GatewayCommand.GW_GET_SCENE_INFORMATION_NTF],
					);
				} catch (error) {
					if (dispose) {
						dispose.dispose();
					}
					reject(error);
				}
			});

			const confirmationFrame = <GW_GET_SCENE_INFORMATION_CFM>(
				await this.Connection.sendFrameAsync(new GW_GET_SCENE_INFORMATION_REQ(this.SceneID))
			);
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

	private async onSessionFinished(frame: GW_SESSION_FINISHED_NTF): Promise<void> {
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
 * @export
 * @class Scenes
 */
export class Scenes {
	private readonly _onChangedScenes = new TypedEvent<number>();
	private readonly _onRemovedScenes = new TypedEvent<number>();
	private readonly _onAddedScenes = new TypedEvent<number>();

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
			await result.refreshScenesAsync();
			return result;
		} catch (error) {
			return Promise.reject(error);
		}
	}

	private _notificationHandler: Disposable | undefined;

	public async refreshScenesAsync(): Promise<void> {
		// Setup notification to receive notification with actuator type
		let dispose: Disposable | undefined;
		const newScenes: Scene[] = [];

		try {
			const notificationHandlerSceneList = new Promise<void>((resolve, reject) => {
				try {
					dispose = this.Connection.on(
						(frame) => {
							if (frame instanceof GW_GET_SCENE_LIST_NTF) {
								frame.Scenes.forEach((scene) => {
									if (typeof this.Scenes[scene.SceneID] === "undefined") {
										const newScene = new Scene(this.Connection, scene.SceneID, scene.Name);
										this.Scenes[scene.SceneID] = newScene;
										newScenes.push(newScene);
									}
								});
								if (frame.NumberOfRemainingScenes === 0) {
									if (dispose) {
										dispose.dispose();
									}

									resolve();
								}
							}
						},
						[GatewayCommand.GW_GET_SCENE_LIST_NTF],
					);
				} catch (error) {
					if (dispose) {
						dispose.dispose();
					}
					reject(error);
				}
			});
			const getSceneListConfirmation = (await this.Connection.sendFrameAsync(
				new GW_GET_SCENE_LIST_REQ(),
			)) as GW_GET_SCENE_LIST_CFM;

			// Wait for GW_GET_SCENE_LIST_NTF, but only if there are scenes defined
			if (getSceneListConfirmation.NumberOfScenes > 0) {
				await notificationHandlerSceneList;
			} else {
				// Otherwise dispose the event handler, because there won't be any events
				if (dispose) {
					dispose.dispose();
				}
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
					async (frame) => await this.onNotificationHandler(frame),
					[GatewayCommand.GW_SCENE_INFORMATION_CHANGED_NTF],
				);
			}

			return Promise.resolve();
		} catch (error) {
			if (dispose) {
				dispose.dispose();
			}
			return Promise.reject(error);
		}
	}

	private async onNotificationHandler(frame: IGW_FRAME_RCV): Promise<void> {
		if (frame instanceof GW_SCENE_INFORMATION_CHANGED_NTF) {
			switch (frame.SceneChangeType) {
				case SceneChangeType.Deleted:
					delete this.Scenes[frame.SceneID];
					await this.notifyRemovedScene(frame.SceneID);
					break;

				case SceneChangeType.Modified:
					await this.Scenes[frame.SceneID].refreshAsync();
					await this.notifyChangedScene(frame.SceneID);

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

	/**
	 * Add an event handler that is called if a scene has been added.
	 *
	 * @param {Listener<number>} handler The handler that is called if the event is emitted.
	 * @returns {Disposable} Call the dispose method of the returned object to remove the handler.
	 * @memberof Scenes
	 */
	public onAddedScene(handler: Listener<number>): Disposable {
		return this._onAddedScenes.on(handler);
	}

	private async notifyChangedScene(sceneId: number): Promise<void> {
		await this._onChangedScenes.emit(sceneId);
	}

	private async notifyRemovedScene(sceneId: number): Promise<void> {
		await this._onRemovedScenes.emit(sceneId);
	}

	private async notifyAddedScene(sceneId: number): Promise<void> {
		await this._onAddedScenes.emit(sceneId);
	}

	/**
	 * Finds a scene by its name and returns the scene object.
	 *
	 * @param {string} sceneName The name of the scene.
	 * @returns {(Scene | undefined)} Returns the scene object if found, otherwise undefined.
	 * @memberof Scenes
	 */
	public findByName(sceneName: string): Scene | undefined {
		return this.Scenes.find((sc) => typeof sc !== "undefined" && sc.SceneName === sceneName);
	}
}
