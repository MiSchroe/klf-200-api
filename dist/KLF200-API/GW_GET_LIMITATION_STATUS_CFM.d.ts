/// <reference types="node" />
import { GW_FRAME_CFM, GW_INVERSE_STATUS } from "./common";
export declare class GW_GET_LIMITATION_STATUS_CFM extends GW_FRAME_CFM {
    readonly SessionID: number;
    readonly Status: GW_INVERSE_STATUS;
    constructor(Data: Buffer);
}
