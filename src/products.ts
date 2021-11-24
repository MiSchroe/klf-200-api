"use strict";

import { Velocity, ActuatorType, NodeVariation, PowerSaveMode, NodeOperatingState, ActuatorAlias } from "./KLF200-API/GW_SYSTEMTABLE_DATA";
import { GW_GET_NODE_INFORMATION_NTF } from "./KLF200-API/GW_GET_NODE_INFORMATION_NTF";
import { GW_GET_ALL_NODES_INFORMATION_NTF } from "./KLF200-API/GW_GET_ALL_NODES_INFORMATION_NTF";
import { IConnection } from "./connection";
import { GW_SET_NODE_NAME_CFM } from "./KLF200-API/GW_SET_NODE_NAME_CFM";
import { GW_SET_NODE_NAME_REQ } from "./KLF200-API/GW_SET_NODE_NAME_REQ";
import { GW_COMMON_STATUS, GatewayCommand, IGW_FRAME_RCV, GW_INVERSE_STATUS } from "./KLF200-API/common";
import { GW_SET_NODE_VARIATION_CFM } from "./KLF200-API/GW_SET_NODE_VARIATION_CFM";
import { GW_SET_NODE_VARIATION_REQ } from "./KLF200-API/GW_SET_NODE_VARIATION_REQ";
import { GW_SET_NODE_ORDER_AND_PLACEMENT_CFM } from "./KLF200-API/GW_SET_NODE_ORDER_AND_PLACEMENT_CFM";
import { GW_SET_NODE_ORDER_AND_PLACEMENT_REQ } from "./KLF200-API/GW_SET_NODE_ORDER_AND_PLACEMENT_REQ";
import { TypedEvent, Listener, Disposable } from "./utils/TypedEvent";
import { Component } from "./utils/PropertyChangedEvent";
import { GW_NODE_INFORMATION_CHANGED_NTF } from "./KLF200-API/GW_NODE_INFORMATION_CHANGED_NTF";
import { GW_NODE_STATE_POSITION_CHANGED_NTF } from "./KLF200-API/GW_NODE_STATE_POSITION_CHANGED_NTF";
import { GW_COMMAND_SEND_REQ } from "./KLF200-API/GW_COMMAND_SEND_REQ";
import { GW_COMMAND_SEND_CFM } from "./KLF200-API/GW_COMMAND_SEND_CFM";
import { GW_GET_ALL_NODES_INFORMATION_REQ } from "./KLF200-API/GW_GET_ALL_NODES_INFORMATION_REQ";
import { GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF } from "./KLF200-API/GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF";
import { GW_CS_SYSTEM_TABLE_UPDATE_NTF } from "./KLF200-API/GW_CS_SYSTEM_TABLE_UPDATE_NTF";
import { GW_GET_NODE_INFORMATION_REQ } from "./KLF200-API/GW_GET_NODE_INFORMATION_REQ";
import { GW_WINK_SEND_CFM } from "./KLF200-API/GW_WINK_SEND_CFM";
import { GW_WINK_SEND_REQ } from "./KLF200-API/GW_WINK_SEND_REQ";
import { CommandStatus, RunStatus, StatusReply, ParameterActive, convertPositionRaw, convertPosition } from "./KLF200-API/GW_COMMAND";
import { GW_COMMAND_RUN_STATUS_NTF } from "./KLF200-API/GW_COMMAND_RUN_STATUS_NTF";
import { GW_COMMAND_REMAINING_TIME_NTF } from "./KLF200-API/GW_COMMAND_REMAINING_TIME_NTF";
import { GW_GET_ALL_NODES_INFORMATION_CFM } from "./KLF200-API/GW_GET_ALL_NODES_INFORMATION_CFM";
import { GW_GET_NODE_INFORMATION_CFM } from "./KLF200-API/GW_GET_NODE_INFORMATION_CFM";

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
    public get Velocity(): Velocity { return this._velocity; };
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
    constructor(readonly Connection: IConnection, frame: GW_GET_NODE_INFORMATION_NTF | GW_GET_ALL_NODES_INFORMATION_NTF) {
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

        this.Connection.on(frame => this.onNotificationHandler(frame), [
            GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF, 
            GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF,
            GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
            GatewayCommand.GW_COMMAND_REMAINING_TIME_NTF,
            GatewayCommand.GW_GET_NODE_INFORMATION_NTF
        ]);
    }

    /**
     * Name of the product.
     *
     * @readonly
     * @type {string}
     * @memberof Product
     */
    public get Name(): string { return this._name; }
    /**
     * Renames the product.
     *
     * @param {string} newName New name of the product.
     * @returns {Promise<void>}
     * @memberof Product
     */
    public async setNameAsync(newName: string): Promise<void> {
        try {
            const confirmationFrame = <GW_SET_NODE_NAME_CFM> await this.Connection.sendFrameAsync(new GW_SET_NODE_NAME_REQ(this.NodeID, newName));
            if (confirmationFrame.Status === GW_COMMON_STATUS.SUCCESS) {
                this._name = newName;
                return Promise.resolve();
            }
            else {
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
    public get NodeVariation(): NodeVariation { return this._nodeVariation; }
    /**
     * Sets the variation of a product to a new value.
     *
     * @param {NodeVariation} newNodeVariation New value for the variation of the product.
     * @returns {Promise<void>}
     * @memberof Product
     */
    public async setNodeVariationAsync(newNodeVariation: NodeVariation): Promise<void> {
        try {
            const confirmationFrame = <GW_SET_NODE_VARIATION_CFM> await this.Connection.sendFrameAsync(new GW_SET_NODE_VARIATION_REQ(this.NodeID, newNodeVariation));
            if (confirmationFrame.Status === GW_COMMON_STATUS.SUCCESS) {
                this._nodeVariation = newNodeVariation;
                return Promise.resolve();
            }
            else
            {
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
            const confirmationFrame = <GW_SET_NODE_ORDER_AND_PLACEMENT_CFM> await this.Connection.sendFrameAsync(new GW_SET_NODE_ORDER_AND_PLACEMENT_REQ(this.NodeID, newOrder, newPlacement));
            if (confirmationFrame.Status === GW_COMMON_STATUS.SUCCESS) {
                this._order = newOrder;
                this._placement = newPlacement;
                return Promise.resolve();
            }
            else
            {
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
    public get Order(): number { return this._order; }
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
    public get Placement(): number { return this._placement; }
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
    public get State(): NodeOperatingState { return this._state; }
    /**
     * Raw value of the current position of the product.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    public get CurrentPositionRaw(): number { return this._currentPositionRaw; }
    /**
     * Raw value of the target value for the position of the product.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    public get TargetPositionRaw(): number { return this._targetPositionRaw; }
    /**
     * Raw value of the current position of the functional paramter 1.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    public get FP1CurrentPositionRaw(): number { return this._fp1CurrentPositionRaw; }
    /**
     * Raw value of the current position of the functional paramter 2.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    public get FP2CurrentPositionRaw(): number { return this._fp2CurrentPositionRaw; }
    /**
     * Raw value of the current position of the functional paramter 3.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    public get FP3CurrentPositionRaw(): number { return this._fp3CurrentPositionRaw; }
    /**
     * Raw value of the current position of the functional paramter 4.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    public get FP4CurrentPositionRaw(): number { return this._fp4CurrentPositionRaw; }
    /**
     * Remaining time in seconds to reach the desired target position.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    public get RemainingTime(): number { return this._remainingTime; }
    /**
     * Timestamp of the last change to any of the properties.
     *
     * @readonly
     * @type {Date}
     * @memberof Product
     */
    public get TimeStamp(): Date { return this._timeStamp; }
    /**
     * The current run status of the product.
     *
     * @readonly
     * @type {RunStatus}
     * @memberof Product
     */
    public get RunStatus(): RunStatus { return this._runStatus; }
    /**
     * Additional status information, e.g. that opening a window is overruled by the rain sensor.
     *
     * @readonly
     * @type {StatusReply}
     * @memberof Product
     */
    public get StatusReply(): StatusReply { return this._statusReply; }

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
     * Sets the product to a new position in percent.
     *
     * @param {number} newPosition New position value in percent.
     * @returns {Promise<number>}
     * @memberof Product
     */
    public async setTargetPositionAsync(newPosition: number): Promise<number> {
        try {
            const req = new GW_COMMAND_SEND_REQ(this.NodeID, convertPosition(newPosition, this.TypeID));
            // const dispose = this.connection.on(frame => {
            //     if (frame instanceof GW_SESSION_FINISHED_NTF && frame.SessionID === req.SessionID) {
            //         dispose.dispose();
            //     }
            // }, [GatewayCommand.GW_SESSION_FINISHED_NTF]);
            const confirmationFrame = <GW_COMMAND_SEND_CFM> await this.Connection.sendFrameAsync(req);
            if (confirmationFrame.CommandStatus === CommandStatus.CommandAccepted){
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
     * The target position in percent.
     *
     * @readonly
     * @type {number}
     * @memberof Product
     */
    public get TargetPosition(): number {
        return convertPositionRaw(this._targetPositionRaw, this.TypeID);
    }

    /**
     * Stops the product at the current position.
     *
     * @returns {Promise<number>}
     * @memberof Product
     */
    public async stopAsync(): Promise<number> {
        try {
            const confirmationFrame = <GW_COMMAND_SEND_CFM> await this.Connection.sendFrameAsync(new GW_COMMAND_SEND_REQ(this.NodeID, 0xD200));
            if (confirmationFrame.CommandStatus === CommandStatus.CommandAccepted){
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
     * Let the product "wink". Its main intention is to identify a product.
     * 
     * Winking depends on the product, e.g. a window moves the handle
     * a little bit.
     *
     * @returns {Promise<number>}
     * @memberof Product
     */
    public async winkAsync(): Promise<number> {
        try {
            const confirmationFrame = <GW_WINK_SEND_CFM> await this.Connection.sendFrameAsync(new GW_WINK_SEND_REQ(this.NodeID));
            if (confirmationFrame.Status === GW_INVERSE_STATUS.SUCCESS) {
                return confirmationFrame.SessionID;
            }
            else {
                return Promise.reject(new Error(confirmationFrame.getError()));
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public async refreshAsync(): Promise<void> {
        try {
            const confirmationFrame = <GW_GET_NODE_INFORMATION_CFM> await this.Connection.sendFrameAsync(new GW_GET_NODE_INFORMATION_REQ(this.NodeID));
            if (confirmationFrame.Status === GW_COMMON_STATUS.SUCCESS) {
                return Promise.resolve();
            }
            else {
                return Promise.reject(new Error(confirmationFrame.getError()));
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private onNotificationHandler(frame: IGW_FRAME_RCV): void {
        if (typeof this === "undefined")
            return;

        if (frame instanceof GW_NODE_INFORMATION_CHANGED_NTF) {
            this.onNodeInformationChanged(frame);
        }
        else if (frame instanceof GW_NODE_STATE_POSITION_CHANGED_NTF) {
            this.onNodeStatePositionChanged(frame);
        }
        else if (frame instanceof GW_COMMAND_RUN_STATUS_NTF) {
            this.onRunStatus(frame);
        }
        else if (frame instanceof GW_COMMAND_REMAINING_TIME_NTF) {
            this.onRemainingTime(frame);
        }
        else if (frame instanceof GW_GET_NODE_INFORMATION_NTF) {
            this.onGetNodeInformation(frame);
        }
    }

    private onNodeInformationChanged(frame: GW_NODE_INFORMATION_CHANGED_NTF): void {
        if (frame.NodeID === this.NodeID) {
            if (frame.Name !== this._name) {
                this._name = frame.Name;
                this.propertyChanged("Name");
            }
            if (frame.NodeVariation !== this._nodeVariation) {
                this._nodeVariation = frame.NodeVariation;
                this.propertyChanged("NodeVariation");
            }
            if (frame.Order !== this._order) {
                this._order = frame.Order;
                this.propertyChanged("Order");
            }
            if (frame.Placement !== this._placement) {
                this._placement = frame.Placement;
                this.propertyChanged("Placement");
            }
        }
    }

    private onNodeStatePositionChanged(frame: GW_NODE_STATE_POSITION_CHANGED_NTF): void {
        if (frame.NodeID === this.NodeID) {
            if (frame.OperatingState !== this._state) {
                this._state = frame.OperatingState;
                this.propertyChanged("State");
            }
            if (frame.CurrentPosition !== this._currentPositionRaw) {
                this._currentPositionRaw = frame.CurrentPosition;
                this.propertyChanged("CurrentPositionRaw");
                this.propertyChanged("CurrentPosition");
            }
            if (frame.TargetPosition !== this._targetPositionRaw) {
                this._targetPositionRaw = frame.TargetPosition;
                this.propertyChanged("TargetPositionRaw");
                this.propertyChanged("TargetPosition");
            }
            if (frame.FunctionalPosition1CurrentPosition !== this._fp1CurrentPositionRaw) {
                this._fp1CurrentPositionRaw = frame.FunctionalPosition1CurrentPosition;
                this.propertyChanged("FP1CurrentPositionRaw");
            }
            if (frame.FunctionalPosition2CurrentPosition !== this._fp2CurrentPositionRaw) {
                this._fp2CurrentPositionRaw = frame.FunctionalPosition2CurrentPosition;
                this.propertyChanged("FP2CurrentPositionRaw");
            }
            if (frame.FunctionalPosition3CurrentPosition !== this._fp3CurrentPositionRaw) {
                this._fp3CurrentPositionRaw = frame.FunctionalPosition3CurrentPosition;
                this.propertyChanged("FP3CurrentPositionRaw");
            }
            if (frame.FunctionalPosition4CurrentPosition !== this._fp4CurrentPositionRaw) {
                this._fp4CurrentPositionRaw = frame.FunctionalPosition4CurrentPosition;
                this.propertyChanged("FP4CurrentPositionRaw");
            }
            if (frame.RemainingTime !== this._remainingTime) {
                this._remainingTime = frame.RemainingTime;
                this.propertyChanged("RemainingTime");
            }
            if (frame.TimeStamp.valueOf() !== this._timeStamp.valueOf()) {
                this._timeStamp = frame.TimeStamp;
                this.propertyChanged("TimeStamp");
            }
        }
    }

    private onRunStatus(frame: GW_COMMAND_RUN_STATUS_NTF): void {
        if (frame.NodeID === this.NodeID) {
            switch (frame.NodeParameter) {
                case ParameterActive.MP:
                    if (frame.ParameterValue !== this._currentPositionRaw) {
                        this._currentPositionRaw = frame.ParameterValue;
                        this.propertyChanged("CurrentPositionRaw");
                        this.propertyChanged("CurrentPosition");
                    }
                    break;

                case ParameterActive.FP1:
                    if (frame.ParameterValue !== this._fp1CurrentPositionRaw) {
                        this._fp1CurrentPositionRaw = frame.ParameterValue;
                        this.propertyChanged("FP1CurrentPositionRaw");
                    }
                    break;
            
                case ParameterActive.FP2:
                    if (frame.ParameterValue !== this._fp2CurrentPositionRaw) {
                        this._fp2CurrentPositionRaw = frame.ParameterValue;
                        this.propertyChanged("FP2CurrentPositionRaw");
                    }
                    break;
            
                case ParameterActive.FP3:
                    if (frame.ParameterValue !== this._fp3CurrentPositionRaw) {
                        this._fp3CurrentPositionRaw = frame.ParameterValue;
                        this.propertyChanged("FP3CurrentPositionRaw");
                    }
                    break;
            
                case ParameterActive.FP4:
                    if (frame.ParameterValue !== this._fp4CurrentPositionRaw) {
                        this._fp4CurrentPositionRaw = frame.ParameterValue;
                        this.propertyChanged("FP4CurrentPositionRaw");
                    }
                    break;
            
                default:
                    break;
            }

            if (frame.RunStatus !== this._runStatus) {
                this._runStatus = frame.RunStatus;
                this.propertyChanged("RunStatus");
            }

            if (frame.StatusReply !== this._statusReply) {
                this._statusReply = frame.StatusReply;
                this.propertyChanged("StatusReply");
            }
        }
    }

    private onRemainingTime(frame: GW_COMMAND_REMAINING_TIME_NTF): void {
        if (frame.NodeID === this.NodeID && frame.NodeParameter === ParameterActive.MP && frame.RemainingTime !== this._remainingTime) {
            this._remainingTime = frame.RemainingTime;
            this.propertyChanged("RemainingTime");
        }
    }

    private onGetNodeInformation(frame: GW_GET_NODE_INFORMATION_NTF): void {
        if (frame.NodeID === this.NodeID) {
            if (frame.Order !== this._order) {
                this._order = frame.Order;
                this.propertyChanged("Order");
            }
            if (frame.Placement !== this._placement) {
                this._placement = frame.Placement;
                this.propertyChanged("Placement");
            }
            if (frame.Name !== this._name) {
                this._name = frame.Name;
                this.propertyChanged("Name");
            }
            if (frame.Velocity !== this._velocity) {
                this._velocity = frame.Velocity;
                this.propertyChanged("Velocity");
            }
            if (frame.ActuatorType !== this._TypeID) {
                this._TypeID = frame.ActuatorType;
                this.propertyChanged("TypeID");
            }
            if (frame.ActuatorSubType !== this._SubType) {
                this._SubType = frame.ActuatorSubType;
                this.propertyChanged("SubType");
            }
            if (frame.ProductType !== this._ProductType) {
                this._ProductType = frame.ProductType;
                this.propertyChanged("ProductType");
            }
            if (frame.NodeVariation !== this._nodeVariation) {
                this._nodeVariation = frame.NodeVariation;
                this.propertyChanged("NodeVariation");
            }
            if (frame.PowerSaveMode !== this._PowerSaveMode) {
                this._PowerSaveMode = frame.PowerSaveMode;
                this.propertyChanged("PowerSaveMode");
            }
            if (frame.SerialNumber !== this._SerialNumber) {
                this._SerialNumber = frame.SerialNumber;
                this.propertyChanged("SerialNumber");
            }
            if (frame.OperatingState !== this._state) {
                this._state = frame.OperatingState;
                this.propertyChanged("State");
            }
            if (frame.CurrentPosition !== this._currentPositionRaw) {
                this._currentPositionRaw = frame.CurrentPosition;
                this.propertyChanged("CurrentPositionRaw");
                this.propertyChanged("CurrentPosition");
            }
            if (frame.TargetPosition !== this._targetPositionRaw) {
                this._targetPositionRaw = frame.TargetPosition;
                this.propertyChanged("TargetPositionRaw");
                this.propertyChanged("TargetPosition");
            }
            if (frame.FunctionalPosition1CurrentPosition !== this._fp1CurrentPositionRaw) {
                this._fp1CurrentPositionRaw = frame.FunctionalPosition1CurrentPosition;
                this.propertyChanged("FP1CurrentPositionRaw");
            }
            if (frame.FunctionalPosition2CurrentPosition !== this._fp2CurrentPositionRaw) {
                this._fp2CurrentPositionRaw = frame.FunctionalPosition2CurrentPosition;
                this.propertyChanged("FP2CurrentPositionRaw");
            }
            if (frame.FunctionalPosition3CurrentPosition !== this._fp3CurrentPositionRaw) {
                this._fp3CurrentPositionRaw = frame.FunctionalPosition3CurrentPosition;
                this.propertyChanged("FP3CurrentPositionRaw");
            }
            if (frame.FunctionalPosition4CurrentPosition !== this._fp4CurrentPositionRaw) {
                this._fp4CurrentPositionRaw = frame.FunctionalPosition4CurrentPosition;
                this.propertyChanged("FP4CurrentPositionRaw");
            }
            if (frame.RemainingTime !== this._remainingTime) {
                this._remainingTime = frame.RemainingTime;
                this.propertyChanged("RemainingTime");
            }
            if (frame.TimeStamp.valueOf() !== this._timeStamp.valueOf()) {
                this._timeStamp = frame.TimeStamp;
                this.propertyChanged("TimeStamp");
            }
            this._ProductAlias = frame.ActuatorAliases;
            this.propertyChanged("ProductAlias");
        }
    }
}

/**
 * Use the products object to retrieve a list of products known to your KLF interface.
 * Products are e.g. windows, roller shutters, awnings.
 * 
 * To create an instance of the Products class use the
 * static method [Products.createProductsAsync]{@link Products#createProductsAsync}.
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
            const onNotificationHandler = new Promise<void>((resolve, reject) => {
                try {
                    dispose = this.Connection.on(frame => {
                        if (frame instanceof GW_GET_ALL_NODES_INFORMATION_NTF) {
                            this.Products[frame.NodeID] = new Product(this.Connection, frame);
                        }
                        else if (frame instanceof GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF) {
                            if (dispose) {
                                dispose.dispose();
                            }
                            this.Connection.on(frame => this.onNotificationHandler(frame), [GatewayCommand.GW_CS_SYSTEM_TABLE_UPDATE_NTF]);
                            resolve();
                        }
                    }, [GatewayCommand.GW_GET_ALL_NODES_INFORMATION_NTF, GatewayCommand.GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF]);
                } catch (error) {
                    if (dispose) {
                        dispose.dispose();
                    }
                    reject(error);
                }
            });

            const getAllNodesInformation = <GW_GET_ALL_NODES_INFORMATION_CFM> await this.Connection.sendFrameAsync(new GW_GET_ALL_NODES_INFORMATION_REQ());
            if (getAllNodesInformation.Status !== GW_COMMON_STATUS.SUCCESS) {
                if (dispose) {
                    dispose.dispose();
                }
                return Promise.reject(new Error(getAllNodesInformation.getError()));
            }

            // Wait for nodes information notifications, but only, if there are nodes
            if (getAllNodesInformation.NumberOfNode > 0) {
                await onNotificationHandler;
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

    private notifyNewProduct(nodeId: number): void {
        this._onNewProduct.emit(nodeId);
    }

    private notifiyRemovedProduct(nodeId: number): void {
        this._onRemovedProduct.emit(nodeId);
    }

    private onNotificationHandler(frame: IGW_FRAME_RCV): void {
        if (frame instanceof GW_CS_SYSTEM_TABLE_UPDATE_NTF) {
            // Remove nodes
            for (const nodeID of frame.RemovedNodes) {
                delete this.Products[nodeID];
                this.notifiyRemovedProduct(nodeID);
            }

            // Add nodes
            (
                async () => {
                    for (const nodeID of frame.AddedNodes) {
                        this.Products[nodeID] = await this.addNodeAsync(nodeID);
                        this.notifyNewProduct(nodeID);
                    }
                }
            )().catch(() => {});
        }
    }

    private async addNodeAsync(nodeID: number): Promise<Product> {
        // Setup notification to receive notification with actuator type
        let dispose: Disposable | undefined;

        try {
            const notificationHandler = new Promise<Product>((resolve, reject) => {
                try {
                    dispose = this.Connection.on(frame => {
                        if (dispose) {
                            dispose.dispose();
                        }
                        resolve(new Product(this.Connection, frame as GW_GET_NODE_INFORMATION_NTF));
                    }, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
                } catch (error) {
                    if (dispose) {
                        dispose.dispose();
                    }
                    reject(error);
                }
            });
            const getNodeInformation = <GW_GET_NODE_INFORMATION_CFM> await this.Connection.sendFrameAsync(new GW_GET_NODE_INFORMATION_REQ(nodeID));
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
        return this.Products.find(pr => typeof pr !== "undefined" && pr.Name === productName);
    }
}
