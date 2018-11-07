/// <reference types="node" />
import { GW_FRAME_CFM } from "./common";
export declare class GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM extends GW_FRAME_CFM {
    readonly ActivatedNodes: number[];
    readonly NoContactNodes: number[];
    readonly OtherErrorNodes: number[];
    readonly Status: number;
    constructor(Data: Buffer);
}
