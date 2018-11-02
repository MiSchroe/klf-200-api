/// <reference types="node" />
import { GW_FRAME_NTF } from "./common";
import { ParameterActive } from "./GW_COMMAND";
export declare class GW_COMMAND_REMAINING_TIME_NTF extends GW_FRAME_NTF {
    readonly SessionID: number;
    readonly NodeID: number;
    readonly NodeParameter: ParameterActive;
    readonly RemainingTime: number;
    constructor(Data: Buffer);
}
