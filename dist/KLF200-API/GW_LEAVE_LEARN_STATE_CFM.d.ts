/// <reference types="node" />
import { GW_FRAME_CFM, GW_INVERSE_STATUS } from "./common";
export declare class GW_LEAVE_LEARN_STATE_CFM extends GW_FRAME_CFM {
    readonly Status: GW_INVERSE_STATUS;
    constructor(Data: Buffer);
    getError(): string;
}
