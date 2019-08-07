/// <reference types="node" />
import { GW_FRAME_CFM, GW_INVERSE_STATUS } from "./common";
export declare class GW_SET_LIMITATION_CFM extends GW_FRAME_CFM {
    readonly SessionID: number;
    readonly Status: GW_INVERSE_STATUS;
    constructor(Data: Buffer);
    getError(): string;
}
