/// <reference types="node" />
import { GW_FRAME_CFM, GW_COMMON_STATUS } from "./common";
export declare class GW_INITIALIZE_SCENE_CANCEL_CFM extends GW_FRAME_CFM {
    readonly Status: GW_COMMON_STATUS;
    constructor(Data: Buffer);
    getError(): string;
}
