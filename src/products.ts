import { Velocity, ActuatorType, NodeVariation, PowerSaveMode, NodeOperatingState, ActuatorAlias } from "./KLF200-API/GW_SYSTEMTABLE_DATA";
import { GW_GET_NODE_INFORMATION_NTF } from "./KLF200-API/GW_GET_NODE_INFORMATION_NTF";
import { GW_GET_ALL_NODES_INFORMATION_NTF } from "./KLF200-API/GW_GET_ALL_NODES_INFORMATION_NTF";
import { Connection } from "./connection";
import { GW_SET_NODE_NAME_CFM } from "./KLF200-API/GW_SET_NODE_NAME_CFM";
import { GW_SET_NODE_NAME_REQ } from "./KLF200-API/GW_SET_NODE_NAME_REQ";
import { GW_COMMON_STATUS, GatewayCommand, IGW_FRAME_RCV, GW_INVERSE_STATUS } from "./KLF200-API/common";
import { GW_SET_NODE_VARIATION_CFM } from "./KLF200-API/GW_SET_NODE_VARIATION_CFM";
import { GW_SET_NODE_VARIATION_REQ } from "./KLF200-API/GW_SET_NODE_VARIATION_REQ";
import { GW_SET_NODE_ORDER_AND_PLACEMENT_CFM } from "./KLF200-API/GW_SET_NODE_ORDER_AND_PLACEMENT_CFM";
import { GW_SET_NODE_ORDER_AND_PLACEMENT_REQ } from "./KLF200-API/GW_SET_NODE_ORDER_AND_PLACEMENT_REQ";
import { TypedEvent } from "./utils/TypedEvent";
import { PropertyChangedEvent } from "./utils/PropertyChangedEvent";
import { GW_NODE_INFORMATION_CHANGED_NTF } from "./KLF200-API/GW_NODE_INFORMATION_CHANGED_NTF";
import { GW_NODE_STATE_POSITION_CHANGED_NTF } from "./KLF200-API/GW_NODE_STATE_POSITION_CHANGED_NTF";
import { GW_COMMAND_SEND_REQ } from "./KLF200-API/GW_COMMAND_SEND_REQ";
import { GW_COMMAND_SEND_CFM } from "./KLF200-API/GW_COMMAND_SEND_CFM";
import { GW_SESSION_FINISHED_NTF } from "./KLF200-API/GW_SESSION_FINISHED_NTF";
import { GW_GET_ALL_NODES_INFORMATION_CFM } from "./KLF200-API/GW_GET_ALL_NODES_INFORMATION_CFM";
import { GW_GET_ALL_NODES_INFORMATION_REQ } from "./KLF200-API/GW_GET_ALL_NODES_INFORMATION_REQ";
import { GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF } from "./KLF200-API/GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF";
import { GW_CS_SYSTEM_TABLE_UPDATE_NTF } from "./KLF200-API/GW_CS_SYSTEM_TABLE_UPDATE_NTF";
import { GW_GET_NODE_INFORMATION_REQ } from "./KLF200-API/GW_GET_NODE_INFORMATION_REQ";
import { GW_WINK_SEND_CFM } from "./KLF200-API/GW_WINK_SEND_CFM";
import { GW_WINK_SEND_REQ } from "./KLF200-API/GW_WINK_SEND_REQ";
import { CommandStatus, RunStatus, StatusReply, ParameterActive } from "./KLF200-API/GW_COMMAND";
import { GW_COMMAND_RUN_STATUS_NTF } from "./KLF200-API/GW_COMMAND_RUN_STATUS_NTF";
import { GW_COMMAND_REMAINING_TIME_NTF } from "./KLF200-API/GW_COMMAND_REMAINING_TIME_NTF";

'use strict';

const InverseProductTypes = [
    ActuatorType.WindowOpener,
    ActuatorType.Light,
    ActuatorType.OnOffSwitch,
    ActuatorType.VentilationPoint,
    ActuatorType.ExteriorHeating
];

export class Product {
    public readonly propertyChangedEvent = new TypedEvent<PropertyChangedEvent>();
    private _name: string;
    public readonly NodeID: number;
    public readonly TypeID: ActuatorType;
    public readonly SubType: number;
    private _order: number;
    private _placement: number;
    public readonly Velocity: Velocity;
    private _nodeVariation: NodeVariation;
    public readonly PowerSaveMode: PowerSaveMode;
    public readonly SerialNumber: Buffer;
    public readonly ProductType: number;
    private _state: NodeOperatingState;
    private _currentPositionRaw: number;
    private _targetPositionRaw: number;
    private _fp1CurrentPositionRaw: number;
    private _fp2CurrentPositionRaw: number;
    private _fp3CurrentPositionRaw: number;
    private _fp4CurrentPositionRaw: number;
    private _remainingTime: number;
    private _timeStamp: Date;
    public readonly ProductAlias: ActuatorAlias[];
    private _runStatus: RunStatus = RunStatus.ExecutionCompleted;
    private _statusReply: StatusReply = StatusReply.Unknown;

    constructor(readonly Connection: Connection, frame: GW_GET_NODE_INFORMATION_NTF | GW_GET_ALL_NODES_INFORMATION_NTF) {
        this.NodeID = frame.NodeID;
        this._name = frame.Name;
        this.TypeID = frame.ActuatorType;
        this.SubType = frame.ActuatorSubType;
        this._order = frame.Order;
        this._placement = frame.Placement;
        this.Velocity = frame.Velocity;
        this._nodeVariation = frame.NodeVariation;
        this.PowerSaveMode = frame.PowerSaveMode;
        this.SerialNumber = frame.SerialNumber;
        this.ProductType = frame.ProductType;
        this._state = frame.OperatingState;
        this._currentPositionRaw = frame.CurrentPosition;
        this._targetPositionRaw = frame.TargetPosition;
        this._fp1CurrentPositionRaw = frame.FunctionalPosition1CurrentPosition;
        this._fp2CurrentPositionRaw = frame.FunctionalPosition2CurrentPosition;
        this._fp3CurrentPositionRaw = frame.FunctionalPosition3CurrentPosition;
        this._fp4CurrentPositionRaw = frame.FunctionalPosition4CurrentPosition;
        this._remainingTime = frame.RemainingTime;
        this._timeStamp = frame.TimeStamp;
        this.ProductAlias = frame.ActuatorAliases;

        this.Connection.on(frame => this.onNotificationHandler(frame), [
            GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF, 
            GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF,
            GatewayCommand.GW_COMMAND_RUN_STATUS_NTF,
            GatewayCommand.GW_COMMAND_REMAINING_TIME_NTF
        ]);
    }

    public get Name(): string { return this._name; }
    public async setNameAsync(newName: string): Promise<void> {
        try {
            const confirmationFrame = <GW_SET_NODE_NAME_CFM> await this.Connection.sendFrameAsync(new GW_SET_NODE_NAME_REQ(this.NodeID, newName));
            if (confirmationFrame.Status === GW_COMMON_STATUS.SUCCESS) {
                this._name = newName;
                return Promise.resolve();
            }
            else {
                return Promise.reject(confirmationFrame.Status);
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    
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
                        return "Swinging shutter with independent handling of the leaes";
                
                    default:
                        return "Swinging shutter";
                }

            default:
                return `${this.TypeID.toString()}.${this.SubType.toString()}`;
        }
    }

    public get NodeVariation(): NodeVariation { return this._nodeVariation; }
    public async setNodeVariationAsync(newNodeVariation: NodeVariation): Promise<void> {
        try {
            const confirmationFrame = <GW_SET_NODE_VARIATION_CFM> await this.Connection.sendFrameAsync(new GW_SET_NODE_VARIATION_REQ(this.NodeID, newNodeVariation));
            if (confirmationFrame.Status === GW_COMMON_STATUS.SUCCESS) {
                this._nodeVariation = newNodeVariation;
                return Promise.resolve();
            }
            else
            {
                return Promise.reject(confirmationFrame.Status);
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

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
                return Promise.reject(confirmationFrame.Status);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public get Order(): number { return this._order; }
    public async setOrderAsync(newOrder: number): Promise<void> {
        return this.setOrderAndPlacementAsync(newOrder, this._placement);
    }

    public get Placement(): number { return this._placement; }
    public async setPlacementAsync(newPlacement: number): Promise<void> {
        return this.setOrderAndPlacementAsync(this._order, newPlacement);
    }

    public get State(): NodeOperatingState { return this._state; }
    public get CurrentPositionRaw(): number { return this._currentPositionRaw; }
    public get TargetPositionRaw(): number { return this._targetPositionRaw; }
    public get FP1CurrentPositionRaw(): number { return this._fp1CurrentPositionRaw; }
    public get FP2CurrentPositionRaw(): number { return this._fp2CurrentPositionRaw; }
    public get FP3CurrentPositionRaw(): number { return this._fp3CurrentPositionRaw; }
    public get FP4CurrentPositionRaw(): number { return this._fp4CurrentPositionRaw; }
    public get RemainingTime(): number { return this._remainingTime; }
    public get TimeStamp(): Date { return this._timeStamp; }
    public get RunStatus(): RunStatus { return this._runStatus; }
    public get StatusReply(): StatusReply { return this._statusReply; }

    private convertPositionRaw(positionRaw: number): number {
        if (positionRaw > 0xC800) {
            return NaN; // Can't calculate the current position
        }

        let result = positionRaw / 0xC800;
        if (InverseProductTypes.indexOf(this.TypeID) !== -1) {
            // Percentage has to be calculated reverse
            result = 1 - result;
        }

        return result;
    }

    private convertPosition(position: number): number {
        if (position < 0 || position > 1)
            throw "Position value out of range.";

        if (InverseProductTypes.indexOf(this.TypeID) !== -1) {
            // Percentage has to be calculated reverse
            position = 1 - position;
        }
        return 0xC800 * position;
    }

    public get CurrentPosition(): number {
        return this.convertPositionRaw(this._currentPositionRaw);
    }

    public async setTargetPositionAsync(newPosition: number): Promise<number> {
        try {
            const req = new GW_COMMAND_SEND_REQ(this.NodeID, this.convertPosition(newPosition));
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
                return Promise.reject(confirmationFrame.CommandStatus);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public get TargetPosition(): number {
        return this.convertPositionRaw(this._targetPositionRaw);
    }

    public async stopAsync(): Promise<number> {
        try {
            const confirmationFrame = <GW_COMMAND_SEND_CFM> await this.Connection.sendFrameAsync(new GW_COMMAND_SEND_REQ(this.NodeID, 0xD200));
            if (confirmationFrame.CommandStatus === CommandStatus.CommandAccepted){
                return confirmationFrame.SessionID;
            }
            else {
                return Promise.reject(confirmationFrame.CommandStatus);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public async winkAsync(): Promise<number> {
        try {
            const confirmationFrame = <GW_WINK_SEND_CFM> await this.Connection.sendFrameAsync(new GW_WINK_SEND_REQ(this.NodeID));
            if (confirmationFrame.Status === GW_INVERSE_STATUS.SUCCESS) {
                return confirmationFrame.SessionID;
            }
            else {
                return Promise.reject(confirmationFrame.Status);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    protected propertyChanged(propertyName: keyof Product): void {
        this.propertyChangedEvent.emit({o: this, propertyName: propertyName, propertyValue: this[propertyName]});
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
            if (frame.TimeStamp !== this._timeStamp) {
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
}

export class Products {
    public readonly Products: (Product | undefined)[] = [];

    private constructor(readonly Connection: Connection) {}

    private async initializeProductsAsync(): Promise<void> {
        try {
            return new Promise<void>(async resolve => {
                const dispose = this.Connection.on(frame => {
                    if (frame instanceof GW_GET_ALL_NODES_INFORMATION_NTF) {
                        this.Products[frame.NodeID] = new Product(this.Connection, frame);
                    }
                    else if (frame instanceof GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF) {
                        dispose.dispose();
                        this.Connection.on(this.onNotificationHandler, [GatewayCommand.GW_CS_SYSTEM_TABLE_UPDATE_NTF]);
                        resolve();
                    }
                }, [GatewayCommand.GW_GET_ALL_NODES_INFORMATION_NTF, GatewayCommand.GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF]);
                const confirmationFrame = <GW_GET_ALL_NODES_INFORMATION_CFM> await this.Connection.sendFrameAsync(new GW_GET_ALL_NODES_INFORMATION_REQ());
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private onNotificationHandler(frame: IGW_FRAME_RCV): void {
        if (frame instanceof GW_CS_SYSTEM_TABLE_UPDATE_NTF) {
            // Remove nodes
            frame.RemovedNodes.forEach(nodeID => { this.Products[nodeID] = undefined});

            // Add nodes
            frame.AddedNodes.forEach(async nodeID => { this.Products[nodeID] = await this.addNodeAsync(nodeID); });
        }
    }

    private async addNodeAsync(nodeID: number): Promise<Product> {
        try {
            return new Promise<Product>(async resolve => {
                const dispose = this.Connection.on(frame => {
                    dispose.dispose();
                    resolve(new Product(this.Connection, frame as GW_GET_NODE_INFORMATION_NTF));
                }, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
                await this.Connection.sendFrameAsync(new GW_GET_NODE_INFORMATION_REQ(nodeID));
            });
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    static async createProductsAsync(Connection: Connection): Promise<Products> {
        try {
            const result = new Products(Connection);
            await result.initializeProductsAsync();
            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

// /**
//  * Create a new products object.
//  * Use the products object to retrieve a list of products known to your KLF interface.
//  * @constructor
//  * @param {connection} connection The connection object that handles the communication to the KLF interface.
//  */
// function products(connection) {
//     this.connection = connection;
// }

// /**
//  * Gets a list of your products.
//  * @return {Promise} Returns a promise that resolves to the products array.
//  */
// products.prototype.getAsync = function () {
//     return this.connection.postAsync(urlBuilder.products, 'get', null)
//         .then((res) => {
//             return res.data;
//         });
// };

// module.exports = products;
