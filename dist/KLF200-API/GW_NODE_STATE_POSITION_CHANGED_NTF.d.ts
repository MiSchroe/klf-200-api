/// <reference types="node" />
import { GW_FRAME_NTF } from "./common";
import { NodeOperatingState } from "./GW_SYSTEMTABLE_DATA";
export declare class GW_NODE_STATE_POSITION_CHANGED_NTF extends GW_FRAME_NTF {
    readonly NodeID: number;
    readonly OperatingState: NodeOperatingState;
    readonly CurrentPosition: number;
    readonly TargetPosition: number;
    readonly FunctionalPosition1CurrentPosition: number;
    readonly FunctionalPosition2CurrentPosition: number;
    readonly FunctionalPosition3CurrentPosition: number;
    readonly FunctionalPosition4CurrentPosition: number;
    readonly RemainingTime: number;
    readonly TimeStamp: Date;
    constructor(Data: Buffer);
}
