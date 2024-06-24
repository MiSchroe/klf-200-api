"use strict";

import { setImmediate } from "timers/promises";
import {
	CommandOriginator,
	CommandStatus,
	FunctionalParameter,
	LimitationType,
	LockTime,
	ParameterActive,
	PriorityLevel,
	PriorityLevelInformation,
	PriorityLevelLock,
	RunStatus,
	StatusReply,
	StatusType,
	convertPosition,
	convertPositionRaw,
} from "./KLF200-API/GW_COMMAND.js";
import { GW_COMMAND_REMAINING_TIME_NTF } from "./KLF200-API/GW_COMMAND_REMAINING_TIME_NTF.js";
import { GW_COMMAND_RUN_STATUS_NTF } from "./KLF200-API/GW_COMMAND_RUN_STATUS_NTF.js";
import { GW_COMMAND_SEND_CFM } from "./KLF200-API/GW_COMMAND_SEND_CFM.js";
import { GW_COMMAND_SEND_REQ } from "./KLF200-API/GW_COMMAND_SEND_REQ.js";
import { GW_CS_SYSTEM_TABLE_UPDATE_NTF } from "./KLF200-API/GW_CS_SYSTEM_TABLE_UPDATE_NTF.js";
import { GW_ERROR, GW_ERROR_NTF } from "./KLF200-API/GW_ERROR_NTF.js";
import { GW_GET_ALL_NODES_INFORMATION_CFM } from "./KLF200-API/GW_GET_ALL_NODES_INFORMATION_CFM.js";
import { GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF } from "./KLF200-API/GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF.js";
import { GW_GET_ALL_NODES_INFORMATION_NTF } from "./KLF200-API/GW_GET_ALL_NODES_INFORMATION_NTF.js";
import { GW_GET_ALL_NODES_INFORMATION_REQ } from "./KLF200-API/GW_GET_ALL_NODES_INFORMATION_REQ.js";
import { GW_GET_LIMITATION_STATUS_CFM } from "./KLF200-API/GW_GET_LIMITATION_STATUS_CFM.js";
import { GW_GET_LIMITATION_STATUS_REQ } from "./KLF200-API/GW_GET_LIMITATION_STATUS_REQ.js";
import { GW_GET_NODE_INFORMATION_CFM } from "./KLF200-API/GW_GET_NODE_INFORMATION_CFM.js";
import { GW_GET_NODE_INFORMATION_NTF } from "./KLF200-API/GW_GET_NODE_INFORMATION_NTF.js";
import { GW_GET_NODE_INFORMATION_REQ } from "./KLF200-API/GW_GET_NODE_INFORMATION_REQ.js";
import { GW_GET_STATE_CFM, GatewayState, GatewaySubState } from "./KLF200-API/GW_GET_STATE_CFM.js";
import { GW_GET_STATE_REQ } from "./KLF200-API/GW_GET_STATE_REQ.js";
import { GW_LIMITATION_STATUS_NTF } from "./KLF200-API/GW_LIMITATION_STATUS_NTF.js";
import { GW_NODE_INFORMATION_CHANGED_NTF } from "./KLF200-API/GW_NODE_INFORMATION_CHANGED_NTF.js";
import { GW_NODE_STATE_POSITION_CHANGED_NTF } from "./KLF200-API/GW_NODE_STATE_POSITION_CHANGED_NTF.js";
import { GW_SESSION_FINISHED_NTF } from "./KLF200-API/GW_SESSION_FINISHED_NTF.js";
import { GW_SET_LIMITATION_CFM } from "./KLF200-API/GW_SET_LIMITATION_CFM.js";
import { GW_SET_LIMITATION_REQ } from "./KLF200-API/GW_SET_LIMITATION_REQ.js";
import { GW_SET_NODE_NAME_CFM } from "./KLF200-API/GW_SET_NODE_NAME_CFM.js";
import { GW_SET_NODE_NAME_REQ } from "./KLF200-API/GW_SET_NODE_NAME_REQ.js";
import { GW_SET_NODE_ORDER_AND_PLACEMENT_CFM } from "./KLF200-API/GW_SET_NODE_ORDER_AND_PLACEMENT_CFM.js";
import { GW_SET_NODE_ORDER_AND_PLACEMENT_REQ } from "./KLF200-API/GW_SET_NODE_ORDER_AND_PLACEMENT_REQ.js";
import { GW_SET_NODE_VARIATION_CFM } from "./KLF200-API/GW_SET_NODE_VARIATION_CFM.js";
import { GW_SET_NODE_VARIATION_REQ } from "./KLF200-API/GW_SET_NODE_VARIATION_REQ.js";
import { GW_STATUS_REQUEST_CFM } from "./KLF200-API/GW_STATUS_REQUEST_CFM.js";
import { GW_STATUS_REQUEST_NTF } from "./KLF200-API/GW_STATUS_REQUEST_NTF.js";
import { GW_STATUS_REQUEST_REQ } from "./KLF200-API/GW_STATUS_REQUEST_REQ.js";
import {
	ActuatorAlias,
	ActuatorType,
	NodeOperatingState,
	NodeVariation,
	PowerSaveMode,
	Velocity,
} from "./KLF200-API/GW_SYSTEMTABLE_DATA.js";
import { GW_WINK_SEND_CFM } from "./KLF200-API/GW_WINK_SEND_CFM.js";
import { GW_WINK_SEND_REQ } from "./KLF200-API/GW_WINK_SEND_REQ.js";
import { GW_COMMON_STATUS, GW_INVERSE_STATUS, GatewayCommand, IGW_FRAME_RCV } from "./KLF200-API/common.js";
import { IConnection } from "./connection.js";
import { Component } from "./utils/PropertyChangedEvent.js";
import { Disposable, Listener, TypedEvent } from "./utils/TypedEvent.js";

/**
 * Each product that is registered at the KLF-200 interface will be created
 * as an instance of the Product class.
 *
 * @export
 * @class Product
 */
export class Product extends Component {
	private _name: string;
	/**
	 * NodeID is an Actuator index in the system table, to get information from. It must be a
	 * value from 0 to 199.
	 *
	 * @type {number}
	 * @memberof Product
	 */
	public readonly NodeID: number;
	private _TypeID: ActuatorType;
	/**
	 * Indicates the node type, ex. Window, Roller shutter, Light etc.
	 *
	 * @readonly
	 * @type {ActuatorType}
	 * @memberof Product
	 */
	public get TypeID(): ActuatorType {
		return this._TypeID;
	}
	private _SubType: number;
	/**
	 * Details the node type and depends on the TypeID property.
	 *
	 * @readonly
	 * @type {number}
	 * @memberof Product
	 */
	public get SubType(): number {
		return this._SubType;
	}
	private _order: number;
	private _placement: number;
	private _velocity: Velocity;
	/**
	 * Velocity the node is operated with.
	 *
	 * @readonly
	 * @type {Velocity}
	 * @memberof Product
	 */
	public get Velocity(): Velocity {
		return this._velocity;
	}
	private _nodeVariation: NodeVariation;
	private _PowerSaveMode: PowerSaveMode;
	/**
	 * The power mode of the node.
	 *
	 * @readonly
	 * @type {PowerSaveMode}
	 * @memberof Product
	 */
	public get PowerSaveMode(): PowerSaveMode {
		return this._PowerSaveMode;
	}
	private _SerialNumber: Buffer;
	/**
	 * The serial number of the product.
	 *
	 * @readonly
	 * @type {Buffer}
	 * @memberof Product
	 */
	public get SerialNumber(): Buffer {
		return this._SerialNumber;
	}
	private _ProductType: number;
	/**
	 * Type of the product, eg. KMG, KMX.
	 *
	 * @readonly
	 * @type {number}
	 * @memberof Product
	 */
	public get ProductType(): number {
		return this._ProductType;
	}
	private _state: NodeOperatingState;
	private _currentPositionRaw: number;
	private _targetPositionRaw: number;
	private _fp1CurrentPositionRaw: number;
	private _fp2CurrentPositionRaw: number;
	private _fp3CurrentPositionRaw: number;
	private _fp4CurrentPositionRaw: number;
	private _remainingTime: number;
	private _timeStamp: Date;
	private _ProductAlias: ActuatorAlias[];
	/**
	 * Contains the position values to move the product to a special position.
	 * The special position is defined by the alias value.
	 *
	 * E.g. for a window the alias ID for secured ventilation if 0xD803.
	 * To move a product into secured ventilation position you have to read
	 * the value of the alias for the alias ID 0xD803 and set the
	 * raw target position to that value. Different types of windows
	 * may return different raw positions.
	 *
	 * @type {ActuatorAlias[]}
	 * @memberof Product
	 */
	public get ProductAlias(): ActuatorAlias[] {
		return this._ProductAlias;
	}
	private _runStatus: RunStatus = RunStatus.ExecutionCompleted;
	private _statusReply: StatusReply = StatusReply.Unknown;

	/**
	 * Creates an instance of Product. You shouldn't create instances
	 * of the [[Product]] class by yourself. Instead, use the [[Products]] class
	 * to read all installed products from the KLF-200.
	 *
	 * @param {IConnection} Connection The connection object that handles the communication to the KLF interface.
	 * @param {(GW_GET_NODE_INFORMATION_NTF | GW_GET_ALL_NODES_INFORMATION_NTF)} frame Notification frame that is used to set the properties of the Product class instance.
	 * @memberof Product
	 */
	constructor(
		readonly Connection: IConnection,
		frame: GW_GET_NODE_INFORMATION_NTF | GW_GET_ALL_NODES_INFORMATION_NTF,
	) {
		super();

		this.NodeID = frame.NodeID;
		this._name = frame.Name;
		this._TypeID = frame.ActuatorType;
		this._SubType = frame.ActuatorSubType;
		this._order = frame.Order;
		this._placement = frame.Placement;
		this._velocity = frame.Velocity;
		this._nodeVariation = frame.NodeVariation;
		this._PowerSaveMode = frame.PowerSaveMode;
		this._SerialNumber = frame.SerialNumber;
		this._ProductType = frame.ProductType;
		this._state = frame.OperatingState;
		this._currentPositionRaw = frame.CurrentPosition;
		this._targetPositionRaw = frame.TargetPosition;
		this._fp1CurrentPositionRaw = frame.FunctionalPosition1CurrentPosition;
		this._fp2CurrentPositionRaw = frame.FunctionalPosition2CurrentPosition;
		this._fp3CurrentPositionRaw = frame.FunctionalPosition3CurrentPosition;
		this._fp4CurrentPositionRaw = frame.FunctionalPosition4CurrentPosition;
		this._remainingTime = frame.RemainingTime;
		this._timeStamp = frame.TimeStamp;
		this._ProductAlias = frame.ActuatorAliases;
		this._limitationMinRaw = new Array<number>(17).fill(0);
		this._limitationMaxRaw = new Array<number>(17).fill(0xc800);
		this._limitationOriginator = new Array<CommandOriginator>(17).fill(CommandOriginator.User);
		this._limitationTimeRaw = new Array<number>(17).fill(LockTime.lockTimeTolockTimeValueForLimitation(Infinity));

		this.Connection.on(
			async (frame) => await this.onNotificationHandler(frame),
			[
				GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF,
				GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF,
				GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
				GatewayCommand.GW_COMMAND_REMAINING_TIME_NTF,
				GatewayCommand.GW_GET_NODE_INFORMATION_NTF,
				GatewayCommand.GW_STATUS_REQUEST_NTF,
			],
		);
	}

	/**
	 * Name of the product.
	 *
	 * @readonly
	 * @type {string}
	 * @memberof Product
	 */
	public get Name(): string {
		return this._name;
	}
	/**
	 * Renames the product.
	 *
	 * @param {string} newName New name of the product.
	 * @returns {Promise<void>}
	 * @memberof Product
	 */
	public async setNameAsync(newName: string): Promise<void> {
		try {
			const confirmationFrame = <GW_SET_NODE_NAME_CFM>(
				await this.Connection.sendFrameAsync(new GW_SET_NODE_NAME_REQ(this.NodeID, newName))
			);
			if (confirmationFrame.Status === GW_COMMON_STATUS.SUCCESS) {
				this._name = newName;
				return Promise.resolve();
			} else {
				return Promise.reject(new Error(confirmationFrame.getError()));
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * String representation of the TypeID and SubType.
	 *
	 * @readonly
	 * @type {string}
	 * @memberof Product
	 */
	public get Category(): string {
		switch (this.TypeID) {
			case ActuatorType.VenetianBlind:
				return "Interior venetian blind";

			case ActuatorType.RollerShutter:
				switch (this.SubType) {
					case 1:
						return "Adjustable slats roller shutter";

					case 2:
						return "Roller shutter with projection";

					default:
						return "Roller shutter";
				}

			case ActuatorType.Awning:
				return "Vertical exterior awning";

			case ActuatorType.WindowOpener:
				switch (this.SubType) {
					case 1:
						return "Window opener with integrated rain sensor";

					default:
						return "Window opener";
				}

			case ActuatorType.GarageOpener:
				return "Garage door opener";

			case ActuatorType.Light:
				return "Light";

			case ActuatorType.GateOpener:
				return "Gate opener";

			case ActuatorType.Lock:
				switch (this.SubType) {
					case 1:
						return "Window lock";

					default:
						return "Door lock";
				}

			case ActuatorType.Blind:
				return "Vertical interior blind";

			case ActuatorType.DualShutter:
				return "Dual roller shutter";

			case ActuatorType.OnOffSwitch:
				return "On/Off switch";

			case ActuatorType.HorizontalAwning:
				return "Horizontal awning";

			case ActuatorType.ExternalVentianBlind:
				return "Exterior venetion blind";

			case ActuatorType.LouvreBlind:
				return "Louvre blind";

			case ActuatorType.CurtainTrack:
				return "Curtain track";

			case ActuatorType.VentilationPoint:
				switch (this.SubType) {
					case 1:
						return "Air inlet";

					case 2:
						return "Air transfer";

					case 3:
						return "Air outlet";

					default:
						return "Ventilation point";
				}

			case ActuatorType.ExteriorHeating:
				return "Exterior heating";

			case ActuatorType.SwingingShutter:
				switch (this.SubType) {
					case 1:
						return "Swinging shutter with independent handling of the leaves";

					default:
						return "Swinging shutter";
				}

			default:
				return `${this.TypeID.toString()}.${this.SubType.toString()}`;
		}
	}

	/**
	 * Defines the variation of a product.
	 *
	 * @readonly
	 * @type {NodeVariation}
	 * @memberof Product
	 */
	public get NodeVariation(): NodeVariation {
		return this._nodeVariation;
	}
	/**
	 * Sets the variation of a product to a new value.
	 *
	 * @param {NodeVariation} newNodeVariation New value for the variation of the product.
	 * @returns {Promise<void>}
	 * @memberof Product
	 */
	public async setNodeVariationAsync(newNodeVariation: NodeVariation): Promise<void> {
		try {
			const confirmationFrame = <GW_SET_NODE_VARIATION_CFM>(
				await this.Connection.sendFrameAsync(new GW_SET_NODE_VARIATION_REQ(this.NodeID, newNodeVariation))
			);
			if (confirmationFrame.Status === GW_COMMON_STATUS.SUCCESS) {
				this._nodeVariation = newNodeVariation;
				return Promise.resolve();
			} else {
				return Promise.reject(new Error(confirmationFrame.getError()));
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * Sets the order and placement of the product.
	 *
	 * @param {number} newOrder The new order value of the product.
	 * @param {number} newPlacement The new placement value of the product.
	 * @returns {Promise<void>}
	 * @memberof Product
	 */
	public async setOrderAndPlacementAsync(newOrder: number, newPlacement: number): Promise<void> {
		try {
			const confirmationFrame = <GW_SET_NODE_ORDER_AND_PLACEMENT_CFM>(
				await this.Connection.sendFrameAsync(
					new GW_SET_NODE_ORDER_AND_PLACEMENT_REQ(this.NodeID, newOrder, newPlacement),
				)
			);
			if (confirmationFrame.Status === GW_COMMON_STATUS.SUCCESS) {
				this._order = newOrder;
				this._placement = newPlacement;
				return Promise.resolve();
			} else {
				return Promise.reject(new Error(confirmationFrame.getError()));
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * The order in which the products should be displayed by a client application.
	 *
	 * @readonly
	 * @type {number}
	 * @memberof Product
	 */
	public get Order(): number {
		return this._order;
	}
	/**
	 * Sets a new value for the order number of the product.
	 *
	 * @param {number} newOrder New value for the order property.
	 * @returns {Promise<void>}
	 * @memberof Product
	 */
	public async setOrderAsync(newOrder: number): Promise<void> {
		return this.setOrderAndPlacementAsync(newOrder, this._placement);
	}

	/**
	 * The placement of the product. Either a house index or a room index number.
	 *
	 * @readonly
	 * @type {number}
	 * @memberof Product
	 */
	public get Placement(): number {
		return this._placement;
	}
	/**
	 * Sets a new value for the placement of the product.
	 *
	 * @param {number} newPlacement New value for the placement property.
	 * @returns {Promise<void>}
	 * @memberof Product
	 */
	public async setPlacementAsync(newPlacement: number): Promise<void> {
		return this.setOrderAndPlacementAsync(this._order, newPlacement);
	}

	/**
	 * Current operating state of the product.
	 *
	 * @readonly
	 * @type {NodeOperatingState}
	 * @memberof Product
	 */
	public get State(): NodeOperatingState {
		return this._state;
	}
	/**
	 * Raw value of the current position of the product.
	 *
	 * @readonly
	 * @type {number}
	 * @memberof Product
	 */
	public get CurrentPositionRaw(): number {
		return this._currentPositionRaw;
	}
	/**
	 * Raw value of the target value for the position of the product.
	 *
	 * @readonly
	 * @type {number}
	 * @memberof Product
	 */
	public get TargetPositionRaw(): number {
		return this._targetPositionRaw;
	}
	/**
	 * Raw value of the current position of the functional paramter 1.
	 *
	 * @readonly
	 * @type {number}
	 * @memberof Product
	 */
	public get FP1CurrentPositionRaw(): number {
		return this._fp1CurrentPositionRaw;
	}
	/**
	 * Raw value of the current position of the functional paramter 2.
	 *
	 * @readonly
	 * @type {number}
	 * @memberof Product
	 */
	public get FP2CurrentPositionRaw(): number {
		return this._fp2CurrentPositionRaw;
	}
	/**
	 * Raw value of the current position of the functional paramter 3.
	 *
	 * @readonly
	 * @type {number}
	 * @memberof Product
	 */
	public get FP3CurrentPositionRaw(): number {
		return this._fp3CurrentPositionRaw;
	}
	/**
	 * Raw value of the current position of the functional paramter 4.
	 *
	 * @readonly
	 * @type {number}
	 * @memberof Product
	 */
	public get FP4CurrentPositionRaw(): number {
		return this._fp4CurrentPositionRaw;
	}
	/**
	 * Remaining time in seconds to reach the desired target position.
	 *
	 * @readonly
	 * @type {number}
	 * @memberof Product
	 */
	public get RemainingTime(): number {
		return this._remainingTime;
	}
	/**
	 * Timestamp of the last change to any of the properties.
	 *
	 * @readonly
	 * @type {Date}
	 * @memberof Product
	 */
	public get TimeStamp(): Date {
		return this._timeStamp;
	}
	/**
	 * The current run status of the product.
	 *
	 * @readonly
	 * @type {RunStatus}
	 * @memberof Product
	 */
	public get RunStatus(): RunStatus {
		return this._runStatus;
	}
	/**
	 * Additional status information, e.g. that opening a window is overruled by the rain sensor.
	 *
	 * @readonly
	 * @type {StatusReply}
	 * @memberof Product
	 */
	public get StatusReply(): StatusReply {
		return this._statusReply;
	}

	/**
	 * The current position of the product in percent.
	 *
	 * The value is derived from the raw value and depending on
	 * the type ID it is inverted, so that 100% means e.g.
	 * window is fully open, roller shutter is fully closed,
	 * light is at full power etc.
	 *
	 * @readonly
	 * @type {number}
	 * @memberof Product
	 */
	public get CurrentPosition(): number {
		return convertPositionRaw(this._currentPositionRaw, this.TypeID);
	}

	/**
	 * Sets the product to a new position as raw value.
	 *
	 * @param {number} newPosition New position value as raw value.
	 * @param PriorityLevel The priority level for the run command.
	 * @param CommandOriginator The command originator for the run command.
	 * @param ParameterActive The parameter that should be returned in the notifications. MP or FP1-FP16.
	 * @param FunctionalParameters Additional functional paramters can be set during the command.
	 * @param PriorityLevelLock Flag if the priority level lock should be used.
	 * @param PriorityLevels Up to 8 priority levels.
	 * @param LockTime Lock time for the priority levels in seconds (multiple of 30 or Infinity).
	 * @returns {Promise<number>}
	 * @memberof Product
	 */
	public async setTargetPositionRawAsync(
		newPosition: number,
		PriorityLevel: PriorityLevel = 3,
		CommandOriginator: CommandOriginator = 1,
		ParameterActive: ParameterActive = 0,
		FunctionalParameters: FunctionalParameter[] = [],
		PriorityLevelLock: PriorityLevelLock = 0,
		PriorityLevels: PriorityLevelInformation[] = [],
		LockTime: number = Infinity,
	): Promise<number> {
		try {
			const req = new GW_COMMAND_SEND_REQ(
				this.NodeID,
				newPosition,
				PriorityLevel,
				CommandOriginator,
				ParameterActive,
				FunctionalParameters,
				PriorityLevelLock,
				PriorityLevels,
				LockTime,
			);
			const confirmationFrame = <GW_COMMAND_SEND_CFM>await this.Connection.sendFrameAsync(req);
			if (confirmationFrame.CommandStatus === CommandStatus.CommandAccepted) {
				return confirmationFrame.SessionID;
			} else {
				return Promise.reject(new Error(confirmationFrame.getError()));
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * Sets the product to a new position in percent.
	 *
	 * @param {number} newPosition New position value in percent.
	 * @param PriorityLevel The priority level for the run command.
	 * @param CommandOriginator The command originator for the run command.
	 * @param ParameterActive The parameter that should be returned in the notifications. MP or FP1-FP16.
	 * @param FunctionalParameters Additional functional paramters can be set during the command.
	 * @param PriorityLevelLock Flag if the priority level lock should be used.
	 * @param PriorityLevels Up to 8 priority levels.
	 * @param LockTime Lock time for the priority levels in seconds (multiple of 30 or Infinity).
	 * @returns {Promise<number>}
	 * @memberof Product
	 */
	public async setTargetPositionAsync(
		newPosition: number,
		PriorityLevel: PriorityLevel = 3,
		CommandOriginator: CommandOriginator = 1,
		ParameterActive: ParameterActive = 0,
		FunctionalParameters: FunctionalParameter[] = [],
		PriorityLevelLock: PriorityLevelLock = 0,
		PriorityLevels: PriorityLevelInformation[] = [],
		LockTime: number = Infinity,
	): Promise<number> {
		try {
			return await this.setTargetPositionRawAsync(
				convertPosition(newPosition, this.TypeID),
				PriorityLevel,
				CommandOriginator,
				ParameterActive,
				FunctionalParameters,
				PriorityLevelLock,
				PriorityLevels,
				LockTime,
			);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * The target position in percent.
	 *
	 * @readonly
	 * @type {number}
	 * @memberof Product
	 */
	public get TargetPosition(): number {
		return convertPositionRaw(this._targetPositionRaw, this.TypeID);
	}

	private _limitationOriginator: CommandOriginator[];
	/**
	 * A read only array of the limitation originators.
	 * @readonly
	 * @type {CommandOriginator[]}
	 * @memberof Product
	 */
	public get LimitationOriginator(): readonly CommandOriginator[] {
		return Array.from(this._limitationOriginator);
	}

	/**
	 * Returns the limitation originator for a functional parameter.
	 * You have to call {@link refreshLimitationAsync} to get the latest values first.
	 *
	 * @param functionalParameter Paramter for which the limitation originator should be returned.
	 * @returns The limitation originator.
	 */
	public getLimitationOriginator(functionalParameter: ParameterActive): CommandOriginator {
		return this._limitationOriginator[functionalParameter];
	}

	private _limitationTimeRaw: number[];
	/**
	 * A read only array of the limitation time raw values.
	 * @readonly
	 * @type {number[]}
	 * @memberof Product
	 */
	public get LimitationTimeRaw(): readonly number[] {
		return Array.from(this._limitationTimeRaw);
	}

	/**
	 * Returns the raw value of the limitation time for a functional parameter.
	 * You have to call {@link refreshLimitationAsync} to get the latest values first.
	 *
	 * @param functionalParameter Parameter for which the limitation time raw value should be returned.
	 * @returns The raw limitation time value.
	 */
	public getLimitationTimeRaw(functionalParameter: ParameterActive): number {
		return this._limitationTimeRaw[functionalParameter];
	}

	/**
	 * Returns the limitation time in seconds for a functional parameter.
	 * You have to call {@link refreshLimitationAsync} to get the latest values first.
	 *
	 * @param functionalParameter Parameter for which the limitation time should be returned.
	 * @returns The limitation time in seconds or Infinity.
	 */
	public getLimitationTime(functionalParameter: ParameterActive): number {
		return LockTime.lockTimeValueToLockTimeForLimitation(this.getLimitationTimeRaw(functionalParameter));
	}

	private _limitationMinRaw: number[];
	/**
	 * A read only array of the raw limitations' min values.
	 *
	 * @readonly
	 * @type {number[]}
	 * @memberof Product
	 */
	public get LimitationMinRaw(): readonly number[] {
		return Array.from(this._limitationMinRaw);
	}

	/**
	 * The minimum value (raw) of a limitation of the product.
	 *
	 * @readonly
	 * @param functionalParameter Parameter for which the limitation should be returned.
	 * @type {number}
	 * @memberof Product
	 */
	public getLimitationMinRaw(functionalParameter: ParameterActive): number {
		return this._limitationMinRaw[functionalParameter];
	}

	private _limitationMaxRaw: number[];
	/**
	 * A read only array of the raw limitations' max values.
	 *
	 * @readonly
	 * @type {number[]}
	 * @memberof Product
	 */
	public get LimitationMaxRaw(): readonly number[] {
		return Array.from(this._limitationMaxRaw);
	}

	/**
	 * The maximum value (raw) of a limitation of the product.
	 *
	 * @readonly
	 * @param functionalParameter Parameter for which the limitation should be returned.
	 * @type {number}
	 * @memberof Product
	 */
	public getLimitationMaxRaw(functionalParameter: ParameterActive): number {
		return this._limitationMaxRaw[functionalParameter];
	}

	/**
	 * Returns a tuple of min and max values for the limitation of the profided parameter.
	 *
	 * @param functionalParameter Parameter for which the limitations should be returned.
	 * @returns A tuple of the min and max values as percentage in the range [0, 1].
	 */
	public getLimitations(functionalParameter: ParameterActive): [min: number, max: number] {
		const limitationMin = convertPositionRaw(this.getLimitationMinRaw(functionalParameter), this.TypeID);
		const limitationMax = convertPositionRaw(this.getLimitationMaxRaw(functionalParameter), this.TypeID);

		if (limitationMin <= limitationMax) {
			return [limitationMin, limitationMax];
		} else {
			return [limitationMax, limitationMin];
		}
	}

	/**
	 * The minimum value of a limitation of the product.
	 *
	 * @readonly
	 * @param functionalParameter Parameter for which the limitation should be returned.
	 * @type {number}
	 * @memberof Product
	 */
	public getLimitationMin(functionalParameter: ParameterActive): number {
		return this.getLimitations(functionalParameter)[0];
	}

	/**
	 * The maximum value of a limitation of the product.
	 *
	 * @readonly
	 * @param functionalParameter Parameter for which the limitation should be returned.
	 * @type {number}
	 * @memberof Product
	 */
	public getLimitationMax(functionalParameter: ParameterActive): number {
		return this.getLimitations(functionalParameter)[1];
	}

	/**
	 * Stops the product at the current position.
	 *
	 * @param PriorityLevel The priority level for the run command.
	 * @param CommandOriginator The command originator for the run command.
	 * @param ParameterActive The parameter that should be returned in the notifications. MP or FP1-FP16.
	 * @param FunctionalParameters Additional functional paramters can be set during the command.
	 * @param PriorityLevelLock Flag if the priority level lock should be used.
	 * @param PriorityLevels Up to 8 priority levels.
	 * @param LockTime Lock time for the priority levels in seconds (multiple of 30 or Infinity).
	 * @returns {Promise<number>}
	 * @memberof Product
	 */
	public async stopAsync(
		PriorityLevel: PriorityLevel = 3,
		CommandOriginator: CommandOriginator = 1,
		ParameterActive: ParameterActive = 0,
		FunctionalParameters: FunctionalParameter[] = [],
		PriorityLevelLock: PriorityLevelLock = 0,
		PriorityLevels: PriorityLevelInformation[] = [],
		LockTime: number = Infinity,
	): Promise<number> {
		try {
			const confirmationFrame = <GW_COMMAND_SEND_CFM>(
				await this.Connection.sendFrameAsync(
					new GW_COMMAND_SEND_REQ(
						this.NodeID,
						0xd200,
						PriorityLevel,
						CommandOriginator,
						ParameterActive,
						FunctionalParameters,
						PriorityLevelLock,
						PriorityLevels,
						LockTime,
					),
				)
			);
			if (confirmationFrame.CommandStatus === CommandStatus.CommandAccepted) {
				return confirmationFrame.SessionID;
			} else {
				return Promise.reject(new Error(confirmationFrame.getError()));
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * Let the product "wink". Its main intention is to identify a product.
	 *
	 * Winking depends on the product, e.g. a window moves the handle
	 * a little bit.
	 *
	 * @param EnableWink If false wink will be stopped.
	 * @param WinkTime Wink time in seconds (up to 253) or 254 for manufactor defined or 255 for infinite time.
	 * @param PriorityLevel The priority level for the run command.
	 * @param CommandOriginator The command originator for the run command.
	 * @returns {Promise<number>}
	 * @memberof Product
	 */
	public async winkAsync(
		EnableWink: boolean = true,
		WinkTime: number = 254,
		PriorityLevel: PriorityLevel = 3,
		CommandOriginator: CommandOriginator = 1,
	): Promise<number> {
		try {
			const confirmationFrame = <GW_WINK_SEND_CFM>(
				await this.Connection.sendFrameAsync(
					new GW_WINK_SEND_REQ(this.NodeID, EnableWink, WinkTime, PriorityLevel, CommandOriginator),
				)
			);
			if (confirmationFrame.Status === GW_INVERSE_STATUS.SUCCESS) {
				return confirmationFrame.SessionID;
			} else {
				return Promise.reject(new Error(confirmationFrame.getError()));
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * Refresh the data of this product and read the attributes from the gateway.
	 *
	 * This method re-reads the data from the KLF-200. If the product hasn't sent
	 * its recent data to the KLF-200, call [requestStatusAsync](Products.requestStatusAsync) first.
	 *
	 * @returns {Promise<void>}
	 * @memberof Product
	 */
	public async refreshAsync(): Promise<void> {
		try {
			const confirmationFrame = <GW_GET_NODE_INFORMATION_CFM>(
				await this.Connection.sendFrameAsync(new GW_GET_NODE_INFORMATION_REQ(this.NodeID))
			);
			if (confirmationFrame.Status === GW_COMMON_STATUS.SUCCESS) {
				return Promise.resolve();
			} else {
				return Promise.reject(new Error(confirmationFrame.getError()));
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}

	private setupWaitForLimitationFinished(
		sessionID: number,
		limitationType: LimitationType | LimitationType[],
		parameterActive: ParameterActive,
		resolve: (value: void | PromiseLike<void>) => void,
		reject: (reason?: any) => void,
	): Disposable {
		const limitationTypes: LimitationType[] = [];

		if (Array.isArray(limitationType)) {
			limitationTypes.push(...limitationType);
		} else {
			limitationTypes.push(limitationType);
		}

		// Listen to notifications:
		const dispose = this.Connection.on(
			async (frame) => {
				try {
					if (frame instanceof GW_LIMITATION_STATUS_NTF && frame.SessionID === sessionID) {
						if (frame.NodeID !== this.NodeID) {
							throw new Error(`Unexpected node ID: ${frame.NodeID}`);
						}
						if (frame.ParameterID !== parameterActive) {
							throw new Error(`Unexpected parameter ID: ${frame.ParameterID}`);
						}
						if (limitationTypes.indexOf(LimitationType.MinimumLimitation) !== -1) {
							if (frame.LimitationValueMin !== this._limitationMinRaw[frame.ParameterID]) {
								this._limitationMinRaw[frame.ParameterID] = frame.LimitationValueMin;
								await this.propertyChanged("LimitationMinRaw");
							}
						}
						if (limitationTypes.indexOf(LimitationType.MaximumLimitation) !== -1) {
							if (frame.LimitationValueMax !== this._limitationMaxRaw[frame.ParameterID]) {
								this._limitationMaxRaw[frame.ParameterID] = frame.LimitationValueMax;
								await this.propertyChanged("LimitationMaxRaw");
							}
						}
						if (frame.LimitationOriginator !== this._limitationOriginator[frame.ParameterID]) {
							this._limitationOriginator[frame.ParameterID] = frame.LimitationOriginator;
							await this.propertyChanged("LimitationOriginator");
						}
						if (frame.LimitationTime !== this._limitationTimeRaw[frame.ParameterID]) {
							this._limitationTimeRaw[frame.ParameterID] = frame.LimitationTime;
							await this.propertyChanged("LimitationTimeRaw");
						}
					} else if (frame instanceof GW_SESSION_FINISHED_NTF && frame.SessionID === sessionID) {
						dispose?.dispose();
						resolve();
					}
				} catch (error) {
					dispose?.dispose();
					reject(error);
				}
			},
			[GatewayCommand.GW_LIMITATION_STATUS_NTF, GatewayCommand.GW_SESSION_FINISHED_NTF],
		);

		return dispose;
	}

	/**
	 * Refreshes the limitation data for the provided limitation type of a parameter.
	 *
	 * @param limitationType The limitation type for which the data should be refreshed.
	 * @param parameterActive Parameter for which the limitation should be refreshed.
	 * @returns Promise<void>
	 */
	public async refreshLimitationAsync(
		limitationType: LimitationType,
		parameterActive: ParameterActive = ParameterActive.MP,
	): Promise<void> {
		try {
			// Setup the event handlers first to prevent a race condition
			// where we don't see the events.
			let resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void;
			const waitForLimitationFinishedPromise = new Promise((res, rej) => {
				resolve = res;
				reject = rej;
			});

			const frameToSend = new GW_GET_LIMITATION_STATUS_REQ(this.NodeID, limitationType, parameterActive);
			this.setupWaitForLimitationFinished(
				frameToSend.SessionID,
				limitationType,
				parameterActive,
				resolve!,
				reject!,
			);

			const confirmationFrame = <GW_GET_LIMITATION_STATUS_CFM>await this.Connection.sendFrameAsync(frameToSend);
			if (confirmationFrame.Status === GW_INVERSE_STATUS.SUCCESS) {
				await waitForLimitationFinishedPromise;
			} else {
				return Promise.reject(new Error(confirmationFrame.getError()));
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * Sets a new limitation with raw values.
	 *
	 * @param minValue Raw min value of the limitation.
	 * @param maxValue Raw max value of the limitation.
	 * @param parameterActive Parameter for which the limitation should be set.
	 * @param limitationTime Limitation time.
	 * @param commandOriginator Command Originator.
	 * @param priorityLevel Priority Level.
	 * @returns Promise<void>
	 */
	public async setLimitationRawAsync(
		minValue: number,
		maxValue: number,
		parameterActive: ParameterActive = ParameterActive.MP,
		limitationTime: number = 253, // Unlimited time
		commandOriginator: CommandOriginator = CommandOriginator.SAAC,
		priorityLevel: PriorityLevel = PriorityLevel.ComfortLevel2,
	): Promise<void> {
		try {
			// Setup the event handlers first to prevent a race condition
			// where we don't see the events.
			let resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void;
			const waitForLimitationFinishedPromise = new Promise((res, rej) => {
				resolve = res;
				reject = rej;
			});

			const frameToSend = new GW_SET_LIMITATION_REQ(
				this.NodeID,
				minValue,
				maxValue,
				limitationTime,
				priorityLevel,
				commandOriginator,
				parameterActive,
			);
			this.setupWaitForLimitationFinished(
				frameToSend.SessionID,
				[LimitationType.MinimumLimitation, LimitationType.MaximumLimitation],
				parameterActive,
				resolve!,
				reject!,
			);

			const confirmationFrame = <GW_SET_LIMITATION_CFM>await this.Connection.sendFrameAsync(frameToSend);
			if (confirmationFrame.Status === GW_INVERSE_STATUS.SUCCESS) {
				await waitForLimitationFinishedPromise;
			} else {
				return Promise.reject(new Error(confirmationFrame.getError()));
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * Sets a new limitation.
	 *
	 * @param minValue Min value of the limitation in the range [0, 1].
	 * @param maxValue Max value of the limitation in the range [0, 1].
	 * @param parameterActive Parameter for which the limitation should be set.
	 * @param limitationTime Limitation time in seconds. Must be a multiple of 30.
	 * @param commandOriginator Command Originator.
	 * @param priorityLevel Priority Level.
	 * @returns Promise<void>
	 */
	public async setLimitationAsync(
		minValue: number,
		maxValue: number,
		parameterActive: ParameterActive = ParameterActive.MP,
		limitationTime: number = Infinity, // Unlimited time
		commandOriginator: CommandOriginator = CommandOriginator.SAAC,
		priorityLevel: PriorityLevel = PriorityLevel.ComfortLevel2,
	): Promise<void> {
		try {
			if (minValue > maxValue) {
				throw new Error(
					`Parameter minValue (${minValue}) must be less than or equal to parameter maxValue (${maxValue}).`,
				);
			}
			if (minValue < 0 || minValue > 1) {
				throw new Error("Parameter minValue must be between 0 and 1.");
			}
			if (maxValue < 0 || maxValue > 1) {
				throw new Error("Parameter maxValue must be between 0 and 1.");
			}
			let rawMinValue = convertPosition(minValue, this.TypeID);
			let rawMaxValue = convertPosition(maxValue, this.TypeID);
			const rawLimitationTime = LockTime.lockTimeTolockTimeValueForLimitation(limitationTime);

			if (rawMinValue > rawMaxValue) {
				// Based on the actuator type the min/max values have to be swapped
				[rawMinValue, rawMaxValue] = [rawMaxValue, rawMinValue];
			}

			return this.setLimitationRawAsync(
				rawMinValue,
				rawMaxValue,
				parameterActive,
				rawLimitationTime,
				commandOriginator,
				priorityLevel,
			);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * Clears the limitation for the parameter.
	 *
	 * @param parameterActive Parameter for which the limitation should be set.
	 * @param commandOriginator Command Originator.
	 * @param priorityLevel Priority Level.
	 * @returns Promise<void>
	 */
	public async clearLimitationAsync(
		parameterActive: ParameterActive = ParameterActive.MP,
		commandOriginator: CommandOriginator = CommandOriginator.SAAC,
		priorityLevel: PriorityLevel = PriorityLevel.ComfortLevel2,
	): Promise<void> {
		return this.setLimitationRawAsync(0xd400, 0xd400, parameterActive, 255, commandOriginator, priorityLevel);
	}

	private async onNotificationHandler(frame: IGW_FRAME_RCV): Promise<void> {
		if (typeof this === "undefined") return;

		if (frame instanceof GW_NODE_INFORMATION_CHANGED_NTF) {
			await this.onNodeInformationChanged(frame);
		} else if (frame instanceof GW_NODE_STATE_POSITION_CHANGED_NTF) {
			await this.onNodeStatePositionChanged(frame);
		} else if (frame instanceof GW_COMMAND_RUN_STATUS_NTF) {
			await this.onRunStatus(frame);
		} else if (frame instanceof GW_COMMAND_REMAINING_TIME_NTF) {
			await this.onRemainingTime(frame);
		} else if (frame instanceof GW_GET_NODE_INFORMATION_NTF) {
			await this.onGetNodeInformation(frame);
		} else if (frame instanceof GW_STATUS_REQUEST_NTF) {
			await this.onStatusRequest(frame);
		}
	}

	private async onNodeInformationChanged(frame: GW_NODE_INFORMATION_CHANGED_NTF): Promise<void> {
		if (frame.NodeID === this.NodeID) {
			if (frame.Name !== this._name) {
				this._name = frame.Name;
				await this.propertyChanged("Name");
			}
			if (frame.NodeVariation !== this._nodeVariation) {
				this._nodeVariation = frame.NodeVariation;
				await this.propertyChanged("NodeVariation");
			}
			if (frame.Order !== this._order) {
				this._order = frame.Order;
				await this.propertyChanged("Order");
			}
			if (frame.Placement !== this._placement) {
				this._placement = frame.Placement;
				await this.propertyChanged("Placement");
			}
		}
	}

	private async onNodeStatePositionChanged(frame: GW_NODE_STATE_POSITION_CHANGED_NTF): Promise<void> {
		if (frame.NodeID === this.NodeID) {
			if (frame.OperatingState !== this._state) {
				this._state = frame.OperatingState;
				await this.propertyChanged("State");
			}
			if (frame.CurrentPosition !== this._currentPositionRaw) {
				this._currentPositionRaw = frame.CurrentPosition;
				await this.propertyChanged("CurrentPositionRaw");
				await this.propertyChanged("CurrentPosition");
			}
			if (frame.TargetPosition !== this._targetPositionRaw) {
				this._targetPositionRaw = frame.TargetPosition;
				await this.propertyChanged("TargetPositionRaw");
				await this.propertyChanged("TargetPosition");
			}
			if (frame.FunctionalPosition1CurrentPosition !== this._fp1CurrentPositionRaw) {
				this._fp1CurrentPositionRaw = frame.FunctionalPosition1CurrentPosition;
				await this.propertyChanged("FP1CurrentPositionRaw");
			}
			if (frame.FunctionalPosition2CurrentPosition !== this._fp2CurrentPositionRaw) {
				this._fp2CurrentPositionRaw = frame.FunctionalPosition2CurrentPosition;
				await this.propertyChanged("FP2CurrentPositionRaw");
			}
			if (frame.FunctionalPosition3CurrentPosition !== this._fp3CurrentPositionRaw) {
				this._fp3CurrentPositionRaw = frame.FunctionalPosition3CurrentPosition;
				await this.propertyChanged("FP3CurrentPositionRaw");
			}
			if (frame.FunctionalPosition4CurrentPosition !== this._fp4CurrentPositionRaw) {
				this._fp4CurrentPositionRaw = frame.FunctionalPosition4CurrentPosition;
				await this.propertyChanged("FP4CurrentPositionRaw");
			}
			if (frame.RemainingTime !== this._remainingTime) {
				this._remainingTime = frame.RemainingTime;
				await this.propertyChanged("RemainingTime");
			}
			// if (frame.TimeStamp.valueOf() !== this._timeStamp.valueOf()) {
			//     this._timeStamp = frame.TimeStamp;
			//     await this.propertyChanged("TimeStamp");
			// }
		}
	}

	private async onRunStatus(frame: GW_COMMAND_RUN_STATUS_NTF): Promise<void> {
		if (frame.NodeID === this.NodeID) {
			switch (frame.NodeParameter) {
				case ParameterActive.MP:
					if (frame.ParameterValue !== this._currentPositionRaw) {
						this._currentPositionRaw = frame.ParameterValue;
						await this.propertyChanged("CurrentPositionRaw");
						await this.propertyChanged("CurrentPosition");
					}
					break;

				case ParameterActive.FP1:
					if (frame.ParameterValue !== this._fp1CurrentPositionRaw) {
						this._fp1CurrentPositionRaw = frame.ParameterValue;
						await this.propertyChanged("FP1CurrentPositionRaw");
					}
					break;

				case ParameterActive.FP2:
					if (frame.ParameterValue !== this._fp2CurrentPositionRaw) {
						this._fp2CurrentPositionRaw = frame.ParameterValue;
						await this.propertyChanged("FP2CurrentPositionRaw");
					}
					break;

				case ParameterActive.FP3:
					if (frame.ParameterValue !== this._fp3CurrentPositionRaw) {
						this._fp3CurrentPositionRaw = frame.ParameterValue;
						await this.propertyChanged("FP3CurrentPositionRaw");
					}
					break;

				case ParameterActive.FP4:
					if (frame.ParameterValue !== this._fp4CurrentPositionRaw) {
						this._fp4CurrentPositionRaw = frame.ParameterValue;
						await this.propertyChanged("FP4CurrentPositionRaw");
					}
					break;

				default:
					break;
			}

			if (frame.RunStatus !== this._runStatus) {
				this._runStatus = frame.RunStatus;
				await this.propertyChanged("RunStatus");
			}

			if (frame.StatusReply !== this._statusReply) {
				this._statusReply = frame.StatusReply;
				await this.propertyChanged("StatusReply");
			}
		}
	}

	private async onRemainingTime(frame: GW_COMMAND_REMAINING_TIME_NTF): Promise<void> {
		if (
			frame.NodeID === this.NodeID &&
			frame.NodeParameter === ParameterActive.MP &&
			frame.RemainingTime !== this._remainingTime
		) {
			this._remainingTime = frame.RemainingTime;
			await this.propertyChanged("RemainingTime");
		}
	}

	private async onGetNodeInformation(frame: GW_GET_NODE_INFORMATION_NTF): Promise<void> {
		if (frame.NodeID === this.NodeID) {
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
			if (frame.ActuatorType !== this._TypeID) {
				this._TypeID = frame.ActuatorType;
				await this.propertyChanged("TypeID");
			}
			if (frame.ActuatorSubType !== this._SubType) {
				this._SubType = frame.ActuatorSubType;
				await this.propertyChanged("SubType");
			}
			if (frame.ProductType !== this._ProductType) {
				this._ProductType = frame.ProductType;
				await this.propertyChanged("ProductType");
			}
			if (frame.NodeVariation !== this._nodeVariation) {
				this._nodeVariation = frame.NodeVariation;
				await this.propertyChanged("NodeVariation");
			}
			if (frame.PowerSaveMode !== this._PowerSaveMode) {
				this._PowerSaveMode = frame.PowerSaveMode;
				await this.propertyChanged("PowerSaveMode");
			}
			if (!frame.SerialNumber.equals(this._SerialNumber)) {
				this._SerialNumber = frame.SerialNumber;
				await this.propertyChanged("SerialNumber");
			}
			if (frame.OperatingState !== this._state) {
				this._state = frame.OperatingState;
				await this.propertyChanged("State");
			}
			if (frame.CurrentPosition !== this._currentPositionRaw) {
				this._currentPositionRaw = frame.CurrentPosition;
				await this.propertyChanged("CurrentPositionRaw");
				await this.propertyChanged("CurrentPosition");
			}
			if (frame.TargetPosition !== this._targetPositionRaw) {
				this._targetPositionRaw = frame.TargetPosition;
				await this.propertyChanged("TargetPositionRaw");
				await this.propertyChanged("TargetPosition");
			}
			if (frame.FunctionalPosition1CurrentPosition !== this._fp1CurrentPositionRaw) {
				this._fp1CurrentPositionRaw = frame.FunctionalPosition1CurrentPosition;
				await this.propertyChanged("FP1CurrentPositionRaw");
			}
			if (frame.FunctionalPosition2CurrentPosition !== this._fp2CurrentPositionRaw) {
				this._fp2CurrentPositionRaw = frame.FunctionalPosition2CurrentPosition;
				await this.propertyChanged("FP2CurrentPositionRaw");
			}
			if (frame.FunctionalPosition3CurrentPosition !== this._fp3CurrentPositionRaw) {
				this._fp3CurrentPositionRaw = frame.FunctionalPosition3CurrentPosition;
				await this.propertyChanged("FP3CurrentPositionRaw");
			}
			if (frame.FunctionalPosition4CurrentPosition !== this._fp4CurrentPositionRaw) {
				this._fp4CurrentPositionRaw = frame.FunctionalPosition4CurrentPosition;
				await this.propertyChanged("FP4CurrentPositionRaw");
			}
			if (frame.RemainingTime !== this._remainingTime) {
				this._remainingTime = frame.RemainingTime;
				await this.propertyChanged("RemainingTime");
			}
			if (frame.TimeStamp.valueOf() !== this._timeStamp.valueOf()) {
				this._timeStamp = frame.TimeStamp;
				await this.propertyChanged("TimeStamp");
			}
			if (
				// If length differ, then they can't be equal anymore
				this._ProductAlias.length !== frame.ActuatorAliases.length ||
				// Check if some current elements are missing in new frame elements
				this._ProductAlias.some(
					(v1) =>
						!frame.ActuatorAliases.some(
							(v2) => v1.AliasType === v2.AliasType && v1.AliasValue === v2.AliasValue,
						),
				) ||
				// Check if some new frame elements are missing in current elements
				frame.ActuatorAliases.some(
					(v1) =>
						!this._ProductAlias.some(
							(v2) => v1.AliasType === v2.AliasType && v1.AliasValue === v2.AliasValue,
						),
				)
			) {
				this._ProductAlias = frame.ActuatorAliases;
				await this.propertyChanged("ProductAlias");
			}
		}
	}

	private async onStatusRequest(frame: GW_STATUS_REQUEST_NTF): Promise<void> {
		if (frame.NodeID === this.NodeID) {
			if (this._runStatus !== frame.RunStatus) {
				this._runStatus = frame.RunStatus;
				await this.propertyChanged("RunStatus");
			}
			if (this._statusReply !== frame.StatusReply) {
				this._statusReply = frame.StatusReply;
				await this.propertyChanged("StatusReply");
			}
			switch (frame.StatusType) {
				case StatusType.RequestMainInfo:
					if (this._targetPositionRaw !== frame.TargetPosition) {
						this._targetPositionRaw = frame.TargetPosition!;
						await this.propertyChanged("TargetPositionRaw");
						await this.propertyChanged("TargetPosition");
					}
					if (this._currentPositionRaw !== frame.CurrentPosition) {
						this._currentPositionRaw = frame.CurrentPosition!;
						await this.propertyChanged("CurrentPositionRaw");
						await this.propertyChanged("CurrentPosition");
					}
					if (this._remainingTime !== frame.RemainingTime) {
						this._remainingTime = frame.RemainingTime!;
						await this.propertyChanged("RemainingTime");
					}
					break;

				case StatusType.RequestTargetPosition:
					for (const paramData of frame.ParameterData || []) {
						if (paramData.ID === 0) {
							if (this._targetPositionRaw !== paramData.Value) {
								this._targetPositionRaw = paramData.Value!;
								await this.propertyChanged("TargetPositionRaw");
								await this.propertyChanged("TargetPosition");
							}
						}
					}
					break;

				case StatusType.RequestCurrentPosition:
					for (const paramData of frame.ParameterData || []) {
						switch (paramData.ID) {
							case 0:
								if (this._currentPositionRaw !== paramData.Value) {
									this._currentPositionRaw = paramData.Value!;
									await this.propertyChanged("CurrentPositionRaw");
									await this.propertyChanged("CurrentPosition");
								}
								break;

							case 1:
								if (this._fp1CurrentPositionRaw !== paramData.Value) {
									this._fp1CurrentPositionRaw = paramData.Value!;
									await this.propertyChanged("FP1CurrentPositionRaw");
								}
								break;

							case 2:
								if (this._fp2CurrentPositionRaw !== paramData.Value) {
									this._fp2CurrentPositionRaw = paramData.Value!;
									await this.propertyChanged("FP2CurrentPositionRaw");
								}
								break;

							case 3:
								if (this._fp3CurrentPositionRaw !== paramData.Value) {
									this._fp3CurrentPositionRaw = paramData.Value!;
									await this.propertyChanged("FP3CurrentPositionRaw");
								}
								break;

							case 4:
								if (this._fp4CurrentPositionRaw !== paramData.Value) {
									this._fp4CurrentPositionRaw = paramData.Value!;
									await this.propertyChanged("FP4CurrentPositionRaw");
								}
								break;

							default:
								break;
						}
					}
					break;

				case StatusType.RequestRemainingTime:
					for (const paramData of frame.ParameterData || []) {
						if (paramData.ID === 0) {
							if (this._remainingTime !== paramData.Value) {
								this._remainingTime = paramData.Value!;
								await this.propertyChanged("RemainingTime");
							}
						}
					}
					break;

				default:
					break;
			}
		}
	}
}

/**
 * Use the products object to retrieve a list of products known to your KLF interface.
 * Products are e.g. windows, roller shutters, awnings.
 *
 * To create an instance of the Products class use the
 * static method {@link Products.createProductsAsync}.
 *
 * @export
 * @class Products
 */
export class Products {
	private _onNewProduct = new TypedEvent<number>();
	private _onRemovedProduct = new TypedEvent<number>();

	/**
	 * Contains a list of products.
	 * The index of each product corresponds to the
	 * system table index. The range is [0-199].
	 *
	 * @type {Product[]}
	 * @memberof Products
	 */
	public readonly Products: Product[] = [];

	/**
	 *Creates an instance of Products.
	 * @param {IConnection} Connection The connection object that handles the communication to the KLF interface.
	 * @memberof Products
	 */
	private constructor(readonly Connection: IConnection) {}

	private async initializeProductsAsync(): Promise<void> {
		// Setup notification to receive notification with actuator type
		let dispose: Disposable | undefined;

		try {
			// Setup the event handlers first to prevent a race condition
			// where we don't see the events.
			let resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void;
			const onNotificationHandler = new Promise((res, rej) => {
				resolve = res;
				reject = rej;
			});

			dispose = this.Connection.on(
				async (frame) => {
					try {
						if (frame instanceof GW_GET_ALL_NODES_INFORMATION_NTF) {
							const newProduct = new Product(this.Connection, frame);
							this.Products[frame.NodeID] = newProduct;
						} else if (frame instanceof GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF) {
							if (dispose) {
								dispose.dispose();
							}
							this.Connection.on(
								async (frame) => await this.onNotificationHandler(frame),
								[GatewayCommand.GW_CS_SYSTEM_TABLE_UPDATE_NTF],
							);
							resolve();
						}
					} catch (error) {
						if (dispose) {
							dispose.dispose();
						}
						reject(error);
					}
				},
				[
					GatewayCommand.GW_GET_ALL_NODES_INFORMATION_NTF,
					GatewayCommand.GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF,
				],
			);

			const getAllNodesInformation = <GW_GET_ALL_NODES_INFORMATION_CFM>(
				await this.Connection.sendFrameAsync(new GW_GET_ALL_NODES_INFORMATION_REQ())
			);
			if (getAllNodesInformation.Status !== GW_COMMON_STATUS.SUCCESS) {
				if (dispose) {
					dispose.dispose();
				}
				if (
					getAllNodesInformation.Status !==
					GW_COMMON_STATUS.ERROR /* No nodes available -> not a real error */
				) {
					return Promise.reject(new Error(getAllNodesInformation.getError()));
				}
			}

			// Wait for nodes information notifications, but only, if there are nodes
			if (getAllNodesInformation.NumberOfNode > 0) {
				await onNotificationHandler;

				// After reading all the products we would read the limitations once:
				for (const product of this.Products) {
					if (product) {
						// Read the limitations for at least the main parameter (MP)
						await product.refreshLimitationAsync(LimitationType.MinimumLimitation);
						await product.refreshLimitationAsync(LimitationType.MaximumLimitation);
					}
				}
			} else {
				// Otherwise, dispose the notification handler
				if (dispose) {
					dispose.dispose();
				}
			}
		} catch (error) {
			if (dispose) {
				dispose.dispose();
			}
			return Promise.reject(error);
		}
	}

	/**
	 * Adds a handler that will be called if a new product is added to the KLF-200 interface.
	 *
	 * @param {Listener<number>} handler Event handler that is called if a new product is added.
	 * @returns {Disposable} The event handler can be removed by using the dispose method of the returned object.
	 * @memberof Products
	 */
	public onNewProduct(handler: Listener<number>): Disposable {
		return this._onNewProduct.on(handler);
	}

	/**
	 * Adds a handler that will be called if a product is removed from the KLF-200 interface.
	 *
	 * @param {Listener<number>} handler Event handler that is called if a product is removed.
	 * @returns {Disposable} The event handler can be removed by using the dispose method of the returned object.
	 * @memberof Products
	 */
	public onRemovedProduct(handler: Listener<number>): Disposable {
		return this._onRemovedProduct.on(handler);
	}

	private async notifyNewProduct(nodeId: number): Promise<void> {
		await this._onNewProduct.emit(nodeId);
	}

	private async notifiyRemovedProduct(nodeId: number): Promise<void> {
		await this._onRemovedProduct.emit(nodeId);
	}

	private async onNotificationHandler(frame: IGW_FRAME_RCV): Promise<void> {
		if (frame instanceof GW_CS_SYSTEM_TABLE_UPDATE_NTF) {
			// Remove nodes
			for (const nodeID of frame.RemovedNodes) {
				delete this.Products[nodeID];
				await this.notifiyRemovedProduct(nodeID);
			}

			// Add nodes
			if (frame.AddedNodes.length > 0) {
				// Wait until the KLF-200 leaves configuration services handler.
				// Otherwise, we would receive a Busy error.
				const checkForIdle = async (): Promise<boolean> => {
					try {
						const getStateCfm = <GW_GET_STATE_CFM>(
							await this.Connection.sendFrameAsync(new GW_GET_STATE_REQ())
						);
						return (
							getStateCfm.GatewayState === GatewayState.GatewayMode_WithActuatorNodes &&
							getStateCfm.GatewaySubState === GatewaySubState.Idle
						);
					} catch (error) {
						if (
							error instanceof Error &&
							error.cause instanceof GW_ERROR_NTF &&
							error.cause.ErrorNumber === GW_ERROR.Busy
						) {
							return false;
						}
						throw error;
					}
				};

				// Checking for Idle state and adding nodes will be done outside of this handler
				const waitForIdle = async (): Promise<void> => {
					if (await checkForIdle()) {
						for (const nodeID of frame.AddedNodes) {
							this.Products[nodeID] = await this.addNodeAsync(nodeID);
							await this.notifyNewProduct(nodeID);
						}
					} else {
						await setImmediate(await waitForIdle());
					}
				};
				await setImmediate(await waitForIdle());
			}
		}
	}

	private async addNodeAsync(nodeID: number): Promise<Product> {
		// Setup notification to receive notification with actuator type
		let dispose: Disposable | undefined;

		try {
			// Setup the event handlers first to prevent a race condition
			// where we don't see the events.
			let resolve: (value: Product | PromiseLike<Product>) => void, reject: (reason?: any) => void;
			const notificationHandler = new Promise<Product>((res, rej) => {
				resolve = res;
				reject = rej;
			});

			dispose = this.Connection.on(
				async (frame) => {
					try {
						if (dispose) {
							dispose.dispose();
						}
						resolve(new Product(this.Connection, frame as GW_GET_NODE_INFORMATION_NTF));
					} catch (error) {
						if (dispose) {
							dispose.dispose();
						}
						reject(error);
					}
				},
				[GatewayCommand.GW_GET_NODE_INFORMATION_NTF],
			);

			const maxRetryTimestamp = Date.now() + 60_000; // Wait max. 60 seconds.
			const retryIfNotBusy = async (): Promise<GW_GET_NODE_INFORMATION_CFM> => {
				if (Date.now() > maxRetryTimestamp) {
					throw new Error("Can't read node information of added node after 60 seconds.");
				}
				try {
					const getNodeInformation = <GW_GET_NODE_INFORMATION_CFM>(
						await this.Connection.sendFrameAsync(new GW_GET_NODE_INFORMATION_REQ(nodeID))
					);
					return getNodeInformation;
				} catch (error) {
					if (
						error instanceof Error &&
						error.cause instanceof GW_ERROR_NTF &&
						error.cause.ErrorNumber === GW_ERROR.Busy
					) {
						return await setImmediate(await retryIfNotBusy());
					}
					throw error;
				}
			};
			const getNodeInformation = await setImmediate(await retryIfNotBusy());
			if (getNodeInformation.Status !== GW_COMMON_STATUS.SUCCESS) {
				if (dispose) {
					dispose.dispose();
				}
				return Promise.reject(new Error(getNodeInformation.getError()));
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

	/**
	 * Creates a new instance of the Products class.
	 * During the initialization phase of the class
	 * a list of all registered products will be
	 * retrieved from the KFL-200 interface and
	 * stored at the Product array.
	 *
	 * Additionally, some notification handlers
	 * will be instantiated to watch for changes
	 * to the products.
	 *
	 * @static
	 * @param {IConnection} Connection The connection object that handles the communication to the KLF interface.
	 * @returns {Promise<Products>} Resolves to a new instance of the Products class.
	 * @memberof Products
	 */
	static async createProductsAsync(Connection: IConnection): Promise<Products> {
		try {
			const result = new Products(Connection);
			await result.initializeProductsAsync();
			return result;
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * Find a product by its name.
	 *
	 * @param {string} productName Name of the product
	 * @returns {(Product | undefined)} Returns a [[Product]] instance if found, otherwise undefined.
	 * @memberof Products
	 */
	public findByName(productName: string): Product | undefined {
		return this.Products.find((pr) => typeof pr !== "undefined" && pr.Name === productName);
	}

	/**
	 * Requests status data directly from one or more products.
	 *
	 * You can use this method to refresh the state of products in case
	 * that you have missed changes, e.g. a simple remote control may change
	 * the state of the product and you won't receive an event for it.
	 *
	 * @param Nodes The ID of a single product node or an array of IDs of multiple product nodes for which you want to get the status.
	 * @param StatusType The type of request, e.g. current position, target position
	 * @param [FunctionalParameters=[]] Additional functional parameters (FP1-FP16) that should be requested. A maximum of 7 functional parameters can be requested with each call.
	 * @returns {Promise<numer>} The fulfilled promise will return the SessionID.
	 * @memberof Products
	 */
	public async requestStatusAsync(
		Nodes: number[] | number,
		StatusType: StatusType,
		FunctionalParameters: number[] = [],
	): Promise<number> {
		try {
			const confirmationFrame = <GW_STATUS_REQUEST_CFM>(
				await this.Connection.sendFrameAsync(new GW_STATUS_REQUEST_REQ(Nodes, StatusType, FunctionalParameters))
			);
			if (confirmationFrame.CommandStatus === CommandStatus.CommandAccepted) {
				return Promise.resolve(confirmationFrame.SessionID);
			} else {
				return Promise.reject(new Error(confirmationFrame.getError()));
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}
}
