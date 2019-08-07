/// <reference types="node" />
import { GW_FRAME_CFM } from "./common";
export declare class GW_GET_ACTIVATION_LOG_HEADER_CFM extends GW_FRAME_CFM {
    readonly MaxLineCount: number;
    readonly LineCount: number;
    constructor(Data: Buffer);
}
