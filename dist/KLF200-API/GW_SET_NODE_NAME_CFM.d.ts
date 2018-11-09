/// <reference types="node" />
import { GW_FRAME_CFM, GW_COMMON_STATUS } from "./common";
export declare class GW_SET_NODE_NAME_CFM extends GW_FRAME_CFM {
    readonly Status: GW_COMMON_STATUS;
    readonly NodeID: number;
    constructor(Data: Buffer);
}
