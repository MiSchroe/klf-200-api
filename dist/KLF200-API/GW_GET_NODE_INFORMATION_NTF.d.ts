import { GW_FRAME_NTF } from "./common";
import { Velocity, ActuatorType, NodeVariation, PowerSaveMode, NodeOperatingState, ActuatorAlias } from "./GW_SYSTEMTABLE_DATA";
export declare class GW_GET_NODE_INFORMATION_NTF extends GW_FRAME_NTF {
    readonly NodeID: number;
    readonly Order: number;
    readonly Placement: number;
    readonly Name: string;
    readonly Velocity: Velocity;
    readonly ActuatorType: ActuatorType;
    readonly ActuatorSubType: number;
    readonly ProductType: number;
    readonly NodeVariation: NodeVariation;
    readonly PowerSaveMode: PowerSaveMode;
    readonly SerialNumber: Buffer;
    readonly OperatingState: NodeOperatingState;
    readonly CurrentPosition: number;
    readonly TargetPosition: number;
    readonly FunctionalPosition1CurrentPosition: number;
    readonly FunctionalPosition2CurrentPosition: number;
    readonly FunctionalPosition3CurrentPosition: number;
    readonly FunctionalPosition4CurrentPosition: number;
    readonly RemainingTime: number;
    readonly TimeStamp: Date;
    readonly ActuatorAliases: ActuatorAlias[];
    constructor(Data: Buffer);
}
