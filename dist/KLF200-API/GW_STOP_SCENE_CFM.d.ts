/// <reference types="node" />
import { GW_FRAME_CFM } from "./common";
import { ActivateSceneStatus } from "./GW_SCENES";
export declare class GW_STOP_SCENE_CFM extends GW_FRAME_CFM {
    readonly SessionID: number;
    readonly Status: ActivateSceneStatus;
    constructor(Data: Buffer);
    getError(): string;
}
