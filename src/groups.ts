"use strict";

import debugModule from "debug";
import "disposablestack/auto";
import { GW_ACTIVATE_PRODUCTGROUP_REQ } from "./KLF200-API/GW_ACTIVATE_PRODUCTGROUP_REQ.js";
import {
	ActivateProductGroupStatus,
	CommandOriginator,
	ParameterActive,
	PriorityLevel,
	PriorityLevelInformation,
	PriorityLevelLock,
	convertPosition,
} from "./KLF200-API/GW_COMMAND.js";
import { GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF } from "./KLF200-API/GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF.js";
import { GW_GET_ALL_GROUPS_INFORMATION_NTF } from "./KLF200-API/GW_GET_ALL_GROUPS_INFORMATION_NTF.js";
import { GW_GET_ALL_GROUPS_INFORMATION_REQ } from "./KLF200-API/GW_GET_ALL_GROUPS_INFORMATION_REQ.js";
import { GW_GET_GROUP_INFORMATION_NTF } from "./KLF200-API/GW_GET_GROUP_INFORMATION_NTF.js";
import { GW_GET_GROUP_INFORMATION_REQ } from "./KLF200-API/GW_GET_GROUP_INFORMATION_REQ.js";
import { GW_GET_NODE_INFORMATION_NTF } from "./KLF200-API/GW_GET_NODE_INFORMATION_NTF.js";
import { GW_GET_NODE_INFORMATION_REQ } from "./KLF200-API/GW_GET_NODE_INFORMATION_REQ.js";
import { GroupType } from "./KLF200-API/GW_GROUPS.js";
import {
	ChangeType,
	GW_GROUP_INFORMATION_CHANGED_NTF,
	GW_GROUP_INFORMATION_CHANGED_NTF_Modified,
} from "./KLF200-API/GW_GROUP_INFORMATION_CHANGED_NTF.js";
import { GW_SET_GROUP_INFORMATION_REQ } from "./KLF200-API/GW_SET_GROUP_INFORMATION_REQ.js";
import { ActuatorType, NodeVariation, Velocity } from "./KLF200-API/GW_SYSTEMTABLE_DATA.js";
import { GW_COMMON_STATUS, GatewayCommand, IGW_FRAME_RCV } from "./KLF200-API/common.js";
import { IConnection } from "./connection.js";
import { Component } from "./utils/PropertyChangedEvent.js";
import { Listener, TypedEvent } from "./utils/TypedEvent.js";
import { isArrayEqual } from "./utils/UtilityFunctions.js";

const debug = debugModule(`klf-200-api:groups`);

/**
 * The gateway can hold up to 100 groups. A group is a collection of actuator nodes in
conjunction with a name and some other come characteristics.

There are three different group types. House, Room and User defined. There can be only
one instance of the group type house. The GroupID = 0 is reserved for the house group.
An actuator can only be represented in one room group. So, if an actuator is assigned to
a room group it will automatically be removed from another existing room group.
 *
 * @class Group
 */
export class Group extends Component {
	/**
	 * ID of the group.
	 *
	 * @type {number}
	 */
	public readonly GroupID: number;
	private _order: number;
	private _placement: number;
	private _name: string;
	private _velocity: Velocity;
	private _nodeVariation: NodeVariation;
	private _groupType: GroupType;

	/**
	 * List of node IDs which are part of the group.
	 *
	 * @type {number[]}
	 */
	private readonly _Nodes: number[] = [];
	public get Nodes(): number[] {
		return this._Nodes;
	}
	private _revision: number;

	private _disposables: DisposableStack;

	/**
	 * Creates an instance of Group based on the provided notification frame.
	 * You shouldn't create groups by yourself but rather use the [[Groups]] class
	 * to provide you with a list of all groups.
	 * @param {IConnection} Connection The connection that will be used to send and receive commands.
	 * @param {(GW_GET_GROUP_INFORMATION_NTF | GW_GET_ALL_GROUPS_INFORMATION_NTF | GW_GROUP_INFORMATION_CHANGED_NTF)} frame Notification frame that is used to set the properties of the Group class instance.
	 */
	constructor(
		readonly Connection: IConnection,
		frame:
			| GW_GET_GROUP_INFORMATION_NTF
			| GW_GET_ALL_GROUPS_INFORMATION_NTF
			| GW_GROUP_INFORMATION_CHANGED_NTF_Modified,
	) {
		debug(`Creating Group instance.`);
		super();

		this._disposables = new DisposableStack();

		this.GroupID = frame.GroupID;
		this._order = frame.Order;
		this._placement = frame.Placement;
		this._name = frame.Name;
		this._velocity = frame.Velocity;
		this._nodeVariation = frame.NodeVariation;
		this._groupType = frame.GroupType;
		this.Nodes.push(...frame.Nodes);
		this._revision = frame.Revision;

		this._disposables.use(
			this.Connection.on(
				async (frame) => {
					debug(
						`Calling onNotificationHandler for GW_GET_GROUP_INFORMATION_NTF added in Group constructor for GroupID: ${this.GroupID}.`,
					);
					await this.onNotificationHandler(frame);
				},
				[GatewayCommand.GW_GET_GROUP_INFORMATION_NTF],
			),
		);
	}

	public [Symbol.dispose](): void {
		debug(`Disposing Group instance.`);
		this._disposables.dispose();
		super[Symbol.dispose]();
		debug(`Disposed Group instance.`);
	}

	/**
	 * This method fires PropertyChanged events based on the changes
	 * in the frame provided by the parameter.
	 * This method will be used internally and you shouldn't need to
	 * use it on your own.
	 *
	 * @param {GW_GROUP_INFORMATION_CHANGED_NTF_Modified} frame Change notification frame to calculate the changes.
	 */
	public async changeFromNotification(frame: GW_GROUP_INFORMATION_CHANGED_NTF_Modified): Promise<void> {
		debug(`Calling changeFromNotification for GroupID: ${this.GroupID} with frame: ${JSON.stringify(frame)}.`);
		if (this._order !== frame.Order) {
			this._order = frame.Order;
			await this.propertyChanged("Order");
		}
		if (this._placement !== frame.Placement) {
			this._placement = frame.Placement;
			await this.propertyChanged("Placement");
		}
		if (this._name !== frame.Name) {
			this._name = frame.Name;
			await this.propertyChanged("Name");
		}
		if (this._velocity !== frame.Velocity) {
			this._velocity = frame.Velocity;
			await this.propertyChanged("Velocity");
		}
		if (this._nodeVariation !== frame.NodeVariation) {
			this._nodeVariation = frame.NodeVariation;
			await this.propertyChanged("NodeVariation");
		}
		if (this._groupType !== frame.GroupType) {
			this._groupType = frame.GroupType;
			await this.propertyChanged("GroupType");
		}
		if (!isArrayEqual(this.Nodes, frame.Nodes)) {
			this.Nodes.length = 0; // Clear nodes array
			this.Nodes.push(...frame.Nodes);
			await this.propertyChanged("Nodes");
		}
		this._revision = frame.Revision;
	}

	/**
	 * The order in which the groups should be displayed by a client application.
	 *
	 * @readonly
	 * @type {number}
	 */
	public get Order(): number {
		return this._order;
	}

	/**
	 * The placement of the product. Either a house index or a room index number.
	 *
	 * @readonly
	 * @type {number}
	 */
	public get Placement(): number {
		return this._placement;
	}

	/**
	 * Name of the group.
	 *
	 * @readonly
	 * @type {string}
	 */
	public get Name(): string {
		return this._name;
	}

	/**
	 * The velocity at which the products of the group are operated at if possible.
	 *
	 * @readonly
	 * @type {Velocity}
	 */
	public get Velocity(): Velocity {
		return this._velocity;
	}

	/**
	 * Defines the variation of the group.
	 *
	 * @readonly
	 * @type {NodeVariation}
	 */
	public get NodeVariation(): NodeVariation {
		return this._nodeVariation;
	}

	/**
	 * Type of the group.
	 *
	 * * House - The house group can't be changed and contains all node IDs.
	 * * Room - Each product can only be in one room.
	 * * User group - User groups can be defined freely.
	 *
	 * @readonly
	 * @type {GroupType}
	 */
	public get GroupType(): GroupType {
		return this._groupType;
	}

	/**
	 * Change properties of the group.
	 *
	 * If there are no changes in the properties the method returns directly with a resolved promise.
	 *
	 * @param {number} order New value for the Order property.
	 * @param {number} placement New value for the Placement property.
	 * @param {string} name New value for the Name property.
	 * @param {Velocity} velocity New value for the Velocity property.
	 * @param {NodeVariation} nodeVariation New value for the NodeVariation property.
	 * @param {number[]} nodes New list of nodes.
	 * @returns {Promise<void>}
	 */
	public async changeGroupAsync(
		order: number,
		placement: number,
		name: string,
		velocity: Velocity,
		nodeVariation: NodeVariation,
		nodes: number[],
	): Promise<void> {
		debug(
			`Calling changeGroupAsync for GroupID: ${this.GroupID} with order: ${order}, placement: ${placement}, name: ${name}, velocity: ${velocity}, nodeVariation: ${nodeVariation}, nodes: ${JSON.stringify(nodes)}.`,
		);
		try {
			const changedProperties: (keyof this)[] = [];
			if (order !== this._order) changedProperties.push("Order");
			if (placement !== this._placement) changedProperties.push("Placement");
			if (name !== this._name) changedProperties.push("Name");
			if (velocity !== this._velocity) changedProperties.push("Velocity");
			if (nodeVariation !== this._nodeVariation) changedProperties.push("NodeVariation");
			if (!isArrayEqual(nodes, this.Nodes)) changedProperties.push("Nodes");

			// If there are no changes in the properties return directly with a resolved promise.
			if (changedProperties.length === 0) return Promise.resolve();

			const confirmationFrame = await this.Connection.sendFrameAsync(
				new GW_SET_GROUP_INFORMATION_REQ(
					this.GroupID,
					this._revision,
					name,
					this._groupType,
					nodes,
					order,
					placement,
					velocity,
					nodeVariation,
				),
			);
			if (confirmationFrame.Status === GW_COMMON_STATUS.SUCCESS) {
				debug(`GroupID: ${this.GroupID} changed successfully`);
				return Promise.resolve();
			} else {
				debug(`Failed to change GroupID: ${this.GroupID}`);
				return Promise.reject(new Error(confirmationFrame.getError()));
			}
		} catch (error) {
			debug(`Failed to change GroupID: ${this.GroupID}`);
			return Promise.reject(error as Error);
		}
	}

	/**
	 * Sets a new value for the order number of the group.
	 *
	 * @param {number} newOrder New value for the order property.
	 * @returns {Promise<void>}
	 */
	public async setOrderAsync(newOrder: number): Promise<void> {
		debug(`Setting order for GroupID: ${this.GroupID} to "${newOrder}"`);
		return this.changeGroupAsync(
			newOrder,
			this._placement,
			this._name,
			this._velocity,
			this._nodeVariation,
			this.Nodes,
		);
	}

	/**
	 * Sets a new value for the placement of the group.
	 *
	 * @param {number} newPlacement New value for the placement property.
	 * @returns {Promise<void>}
	 */
	public async setPlacementAsync(newPlacement: number): Promise<void> {
		debug(`Setting placement for GroupID: ${this.GroupID} to "${newPlacement}"`);
		return this.changeGroupAsync(
			this._order,
			newPlacement,
			this._name,
			this._velocity,
			this._nodeVariation,
			this.Nodes,
		);
	}

	/**
	 * Renames the group.
	 *
	 * @param {string} newName New name of the group.
	 * @returns {Promise<void>}
	 */
	public async setNameAsync(newName: string): Promise<void> {
		debug(`Setting name for GroupID: ${this.GroupID} to "${newName}"`);
		return this.changeGroupAsync(
			this._order,
			this._placement,
			newName,
			this._velocity,
			this._nodeVariation,
			this.Nodes,
		);
	}

	/**
	 * Sets the velocity for the group.
	 *
	 * @param {Velocity} newVelocity New velocity value for the group.
	 * @returns {Promise<void>}
	 */
	public async setVelocityAsync(newVelocity: Velocity): Promise<void> {
		debug(`Setting velocity for GroupID: ${this.GroupID} to "${newVelocity}"`);
		return this.changeGroupAsync(
			this._order,
			this._placement,
			this._name,
			newVelocity,
			this._nodeVariation,
			this.Nodes,
		);
	}

	/**
	 * Sets the variation of the group to a new value.
	 *
	 * @param {NodeVariation} newNodeVariation New value for the variation of the group.
	 * @returns {Promise<void>}
	 */
	public async setNodeVariationAsync(newNodeVariation: NodeVariation): Promise<void> {
		debug(`Setting NodeVariation for GroupID: ${this.GroupID} to "${newNodeVariation}"`);
		return this.changeGroupAsync(
			this._order,
			this._placement,
			this._name,
			this._velocity,
			newNodeVariation,
			this.Nodes,
		);
	}

	/**
	 * Sets the group to contain the provided list of node IDs in the group.
	 *
	 * @param {number[]} newNodes Array of new node IDs for the group.
	 * @returns {Promise<void>}
	 */
	public async setNodesAsync(newNodes: number[]): Promise<void> {
		debug(`Setting nodes for GroupID: ${this.GroupID} to "${JSON.stringify(newNodes)}"`);
		return this.changeGroupAsync(
			this._order,
			this._placement,
			this._name,
			this._velocity,
			this._nodeVariation,
			newNodes,
		);
	}

	/**
	 * Sets the target position for all products of the group as raw value.
	 *
	 * @param {number} newPositionRaw New target position value as raw value.
	 * @param Velocity The velocity with which the scene will be run.
	 * @param PriorityLevel The priority level for the run command.
	 * @param CommandOriginator The command originator for the run command.
	 * @param ParameterActive The parameter that should be set by this command. MP or FP1-FP16.
	 * @param PriorityLevelLock Flag if the priority level lock should be used.
	 * @param PriorityLevels Up to 8 priority levels.
	 * @param LockTime Lock time for the priority levels in seconds (multiple of 30 or Infinity).
	 * @returns {Promise<number>} Returns the session ID of the command.
	 */
	public async setTargetPositionRawAsync(
		newPositionRaw: number,
		Velocity: Velocity = 0,
		PriorityLevel: PriorityLevel = 3,
		CommandOriginator: CommandOriginator = 1,
		ParameterActive: ParameterActive = 0,
		PriorityLevelLock: PriorityLevelLock = 0,
		PriorityLevels: PriorityLevelInformation[] = [],
		LockTime: number = Infinity,
	): Promise<number> {
		debug(`Setting TargetPositionRaw for GroupID: ${this.GroupID} to ${newPositionRaw}`);
		try {
			const confirmationFrame = await this.Connection.sendFrameAsync(
				new GW_ACTIVATE_PRODUCTGROUP_REQ(
					this.GroupID,
					newPositionRaw,
					PriorityLevel,
					CommandOriginator,
					ParameterActive,
					Velocity,
					PriorityLevelLock,
					PriorityLevels,
					LockTime,
				),
			);
			if (confirmationFrame.Status === ActivateProductGroupStatus.OK) {
				debug(`TargetPositionRaw for GroupID: ${this.GroupID} set to ${newPositionRaw}`);
				return confirmationFrame.SessionID;
			} else {
				debug(`Error setting TargetPositionRaw for GroupID: ${this.GroupID}`);
				return Promise.reject(new Error(confirmationFrame.getError()));
			}
		} catch (error) {
			debug(`Error setting TargetPositionRaw for GroupID: ${this.GroupID}`);
			return Promise.reject(error as Error);
		}
	}

	/**
	 * Sets the target position for all products of the group
	 *
	 * @param {number} newPosition New target position value in percent.
	 * @param Velocity The velocity with which the scene will be run.
	 * @param PriorityLevel The priority level for the run command.
	 * @param CommandOriginator The command originator for the run command.
	 * @param ParameterActive The parameter that should be set by this command. MP or FP1-FP16.
	 * @param PriorityLevelLock Flag if the priority level lock should be used.
	 * @param PriorityLevels Up to 8 priority levels.
	 * @param LockTime Lock time for the priority levels in seconds (multiple of 30 or Infinity).
	 * @returns {Promise<number>} Returns the session ID of the command.
	 */
	public async setTargetPositionAsync(
		newPosition: number,
		Velocity: Velocity = 0,
		PriorityLevel: PriorityLevel = 3,
		CommandOriginator: CommandOriginator = 1,
		ParameterActive: ParameterActive = 0,
		PriorityLevelLock: PriorityLevelLock = 0,
		PriorityLevels: PriorityLevelInformation[] = [],
		LockTime: number = Infinity,
	): Promise<number> {
		debug(`Setting TargetPosition for GroupID: ${this.GroupID} to ${newPosition}`);
		// Get product type from first node ID for conversion
		const nodeID = this.Nodes[0];

		// Setup the event handlers first to prevent a race condition
		// where we don't see the events.
		let resolve: (value: ActuatorType | PromiseLike<ActuatorType>) => void, reject: (reason?: any) => void;
		const nodeTypeIDPromise = new Promise<ActuatorType>((res, rej) => {
			resolve = res;
			reject = rej;
		});

		// Setup notification to receive notification with actuator type
		// Register notification handler
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		using dispose = this.Connection.on(
			(frame) => {
				try {
					debug(
						`Calling handler for GW_GET_NODE_INFORMATION_NTF in Group.setTargetPositionAsync for GroupID: ${this.GroupID}.`,
					);
					if (frame instanceof GW_GET_NODE_INFORMATION_NTF && frame.NodeID === nodeID) {
						const nodeTypeID = frame.ActuatorType;
						resolve(nodeTypeID);
					}
				} catch (error) {
					debug(
						`Error calling handler for GW_GET_NODE_INFORMATION_NTF in Group.setTargetPositionAsync for GroupID: ${this.GroupID}.`,
					);
					reject(error);
				}
			},
			[GatewayCommand.GW_GET_NODE_INFORMATION_NTF],
		);

		const productInformation = await this.Connection.sendFrameAsync(new GW_GET_NODE_INFORMATION_REQ(nodeID));
		if (productInformation.Status !== GW_COMMON_STATUS.SUCCESS) {
			debug(`Error getting node information for GroupID: ${this.GroupID} for nodeID: ${nodeID}`);
			return Promise.reject(new Error(productInformation.getError()));
		}

		return this.setTargetPositionRawAsync(
			convertPosition(newPosition, await nodeTypeIDPromise),
			Velocity,
			PriorityLevel,
			CommandOriginator,
			ParameterActive,
			PriorityLevelLock,
			PriorityLevels,
			LockTime,
		);
	}

	/**
	 * Refresh the data of this group and read the attributes from the gateway.
	 *
	 * You can use this method to refresh the state of the group in case
	 * that you have missed changes, e.g. a simple remote control may change
	 * the state of the group and you won't receive an event for it.
	 *
	 * @returns {Promise<void>}
	 */
	public async refreshAsync(): Promise<void> {
		debug(`Refreshing GroupID: ${this.GroupID}`);
		const confirmationFrame = await this.Connection.sendFrameAsync(new GW_GET_GROUP_INFORMATION_REQ(this.GroupID));
		if (confirmationFrame.Status === GW_COMMON_STATUS.SUCCESS) {
			debug(`GroupID: ${this.GroupID} refreshed successfully`);
			return Promise.resolve();
		} else {
			debug(`Failed to refresh GroupID: ${this.GroupID}`);
			return Promise.reject(new Error(confirmationFrame.getError()));
		}
	}

	private async onNotificationHandler(frame: IGW_FRAME_RCV): Promise<void> {
		if (typeof this === "undefined") return;

		debug(`Handling notification for GroupID: ${this.GroupID} with frame: ${JSON.stringify(frame)}`);
		if (frame instanceof GW_GET_GROUP_INFORMATION_NTF) {
			await this.onGetGroupInformation(frame);
		}
	}

	private async onGetGroupInformation(frame: GW_GET_GROUP_INFORMATION_NTF): Promise<void> {
		debug(`Handling notification for GroupID: ${this.GroupID} with frame: ${JSON.stringify(frame)}`);
		if (frame.GroupID === this.GroupID) {
			if (frame.Order !== this._order) {
				this._order = frame.Order;
				await this.propertyChanged("Order");
			}
			if (frame.Placement !== this._placement) {
				this._placement = frame.Placement;
				await this.propertyChanged("Placement");
			}
			if (frame.Name !== this._name) {
				this._name = frame.Name;
				await this.propertyChanged("Name");
			}
			if (frame.Velocity !== this._velocity) {
				this._velocity = frame.Velocity;
				await this.propertyChanged("Velocity");
			}
			if (frame.NodeVariation !== this._nodeVariation) {
				this._nodeVariation = frame.NodeVariation;
				await this.propertyChanged("NodeVariation");
			}
			if (frame.GroupType !== this._groupType) {
				this._groupType = frame.GroupType;
				await this.propertyChanged("GroupType");
			}
			const hasRemovedNodes = this.Nodes.every((item) => frame.Nodes.includes(item));
			const hasNewNodes = frame.Nodes.every((item) => this.Nodes.includes(item));
			if (hasRemovedNodes || hasNewNodes) {
				this.Nodes.length = 0;
				this.Nodes.push(...frame.Nodes);
				await this.propertyChanged("Nodes");
			}
			this._revision = frame.Revision;
		}
	}
}

/**
 * The Groups class represent all groups defined in the KLF-200.
 *
 * @class Groups
 */
export class Groups implements Disposable {
	private _onChangedGroup = new TypedEvent<number>();
	private _onRemovedGroup = new TypedEvent<number>();

	/**
	 * Contains a list of groups.
	 * The index of each group corresponds to the
	 * group ID.
	 *
	 * @type {Group[]}
	 */
	public readonly Groups: Group[] = [];

	private _disposables = new DisposableStack();

	private constructor(
		readonly Connection: IConnection,
		readonly groupType: GroupType = GroupType.UserGroup,
	) {}

	public [Symbol.dispose](): void {
		debug("Disposing Groups.");
		this._disposables.dispose();
		this.Groups.forEach((group) => group[Symbol.dispose]());
		this.Groups.length = 0;
		debug("Disposed Groups.");
	}

	private async initializeGroupsAsync(): Promise<void> {
		debug("Initializing Groups.");
		// Setup notification to receive notification with actuator type
		// Setup the event handlers first to prevent a race condition
		// where we don't see the events.
		let resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void;
		const notificationHandler = new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		});

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		using dispose = this.Connection.on(
			(frame) => {
				try {
					debug(
						`Calling handler for GW_GET_ALL_GROUPS_INFORMATION_NTF, GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF, GW_GET_GROUP_INFORMATION_NTF in Groups.initializeGroupsAsync.`,
					);
					if (
						frame instanceof GW_GET_ALL_GROUPS_INFORMATION_NTF ||
						frame instanceof GW_GET_GROUP_INFORMATION_NTF
					) {
						this.Groups[frame.GroupID] = new Group(this.Connection, frame);
					} else if (frame instanceof GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF) {
						debug("Received GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF.");
						resolve();
					}
				} catch (error) {
					debug(
						`Error in handler for GW_GET_ALL_GROUPS_INFORMATION_NTF, GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF, GW_GET_GROUP_INFORMATION_NTF in Groups.initializeGroupsAsync: ${error as Error}`,
					);
					reject(error);
				}
			},
			[
				GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_NTF,
				GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF,
				GatewayCommand.GW_GET_GROUP_INFORMATION_NTF,
			],
		);

		const getAllGroupsInformation = await this.Connection.sendFrameAsync(
			new GW_GET_ALL_GROUPS_INFORMATION_REQ(this.groupType),
		);
		if (getAllGroupsInformation.Status !== GW_COMMON_STATUS.SUCCESS) {
			if (
				getAllGroupsInformation.Status !==
				GW_COMMON_STATUS.INVALID_NODE_ID /* No groups available -> not a real error */
			) {
				debug("Failed to get all groups information.");
				return Promise.reject(new Error(getAllGroupsInformation.getError()));
			}
		}

		// Only wait for notifications if there are groups defined
		if (getAllGroupsInformation.NumberOfGroups > 0) {
			debug(`Waiting for notifications for ${getAllGroupsInformation.NumberOfGroups} groups.`);
			await notificationHandler;
		}

		// Finally, setup the event handler for notifications
		this._disposables.use(
			this.Connection.on(
				async (frame) => {
					debug(
						`Calling onNotificationHandler for GW_GROUP_INFORMATION_CHANGED_NTF added in Groups.initializeGroupsAsync.`,
					);
					await this.onNotificationHandler(frame);
				},
				[GatewayCommand.GW_GROUP_INFORMATION_CHANGED_NTF],
			),
		);
	}

	/**
	 * Adds a handler that will be called if a new group is added to the KLF-200 interface or a group has been changed.
	 *
	 * @param {Listener<number>} handler Event handler that is called if a new group is added or a group has been changed.
	 * @returns {Disposable} The event handler can be removed by using the dispose method of the returned object.
	 */
	public onChangedGroup(handler: Listener<number>): Disposable {
		debug("Adding handler for onChangedGroup.");
		return this._onChangedGroup.on(handler);
	}

	/**
	 * Adds a handler that will be called if a group is removed from the KLF-200 interface.
	 *
	 * @param {Listener<number>} handler Event handler that is called if a group is removed.
	 * @returns {Disposable} The event handler can be removed by using the dispose method of the returned object.
	 */
	public onRemovedGroup(handler: Listener<number>): Disposable {
		debug("Adding handler for onRemovedGroup.");
		return this._onRemovedGroup.on(handler);
	}

	private async notifyChangedGroup(groupId: number): Promise<void> {
		debug("Notifying changed group.");
		await this._onChangedGroup.emit(groupId);
	}

	private async notifyRemovedGroup(groupId: number): Promise<void> {
		debug("Notifying removed group.");
		await this._onRemovedGroup.emit(groupId);
	}

	private async onNotificationHandler(frame: IGW_FRAME_RCV): Promise<void> {
		debug(
			`Calling handler for GW_GROUP_INFORMATION_CHANGED_NTF in Groups.onNotificationHandler with frame: ${JSON.stringify(frame)}.`,
		);
		if (frame instanceof GW_GROUP_INFORMATION_CHANGED_NTF) {
			switch (frame.ChangeType) {
				case ChangeType.Deleted:
					// Remove group
					debug(`Removing GroupID: ${frame.GroupID}`);
					if (this.Groups[frame.GroupID]) {
						this.Groups[frame.GroupID][Symbol.dispose]();
					}
					delete this.Groups[frame.GroupID];
					await this.notifyRemovedGroup(frame.GroupID);
					break;

				case ChangeType.Modified:
					// Add or change group
					debug(`Modifying GroupID: ${frame.GroupID}`);
					if (typeof this.Groups[frame.GroupID] === "undefined") {
						// Add node
						this.Groups[frame.GroupID] = new Group(
							this.Connection,
							frame as GW_GROUP_INFORMATION_CHANGED_NTF_Modified,
						);
					} else {
						// Change group
						await this.Groups[frame.GroupID].changeFromNotification(
							frame as GW_GROUP_INFORMATION_CHANGED_NTF_Modified,
						);
					}
					await this.notifyChangedGroup(frame.GroupID);
					break;

				default:
					break;
			}
		}
	}

	/**
	 * Creates a new instance of the Groups class.
	 * During the initialization phase of the class
	 * a list of all groups will be retrieved from
	 * the KLF-200 interface and stored at the
	 * Groups array.
	 *
	 * Additionally, some notification handlers
	 * will be instantiated to watch for changes
	 * to the groups.
	 *
	 * @param {IConnection} Connection The connection object that handles the communication to the KLF interface.
	 * @param [groupType=GroupType.UserGroup] The group type for which the groups should be read. Default is {@link GroupType.UserGroup}.
	 * @returns {Promise<Groups>} Resolves to a new instance of the Groups class.
	 */
	static async createGroupsAsync(
		Connection: IConnection,
		groupType: GroupType = GroupType.UserGroup,
	): Promise<Groups> {
		debug("Creating new instance of Groups.");
		try {
			const result = new Groups(Connection, groupType);
			await result.initializeGroupsAsync();
			debug("Successfully created new instance of Groups.");
			return result;
		} catch (error) {
			debug(`Error while creating new instance of Groups: ${error as Error}`);
			return Promise.reject(error as Error);
		}
	}

	/**
	 * Finds a group by its name and returns the group object.
	 *
	 * @param {string} groupName The name of the group.
	 * @returns {(Group | undefined)} Returns the group object if found, otherwise undefined.
	 */
	public findByName(groupName: string): Group | undefined {
		debug(`Calling findByName with groupName: ${groupName}.`);
		return this.Groups.find((grp) => typeof grp !== "undefined" && grp.Name === groupName);
	}
}
