/// <reference types="node" />
import { GW_FRAME_CFM, GW_COMMON_STATUS } from "./common";
export declare class GW_SET_NODE_ORDER_AND_PLACEMENT_CFM extends GW_FRAME_CFM {
    readonly Status: GW_COMMON_STATUS;
    readonly NodeID: number;
    constructor(Data: Buffer);
}
