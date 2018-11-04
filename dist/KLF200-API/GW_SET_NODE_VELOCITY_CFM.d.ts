/// <reference types="node" />
import { GW_FRAME_CFM, GW_COMMON_STATUS } from "./common";
import { Velocity } from "./GW_SYSTEMTABLE_DATA";
export declare class GW_SET_NODE_VELOCITY_CFM extends GW_FRAME_CFM {
    readonly Status: GW_COMMON_STATUS;
    readonly Velocity: Velocity;
    constructor(Data: Buffer);
}
