/// <reference types="node" />
import { GW_FRAME_CFM } from "./common";
import { InitializeSceneConfirmationStatus } from "./GW_SCENES";
export declare class GW_INITIALIZE_SCENE_CFM extends GW_FRAME_CFM {
    readonly Status: InitializeSceneConfirmationStatus;
    constructor(Data: Buffer);
    getError(): string;
}
