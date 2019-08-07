/// <reference types="node" />
import { GW_FRAME_NTF } from "./common";
import { InitializeSceneNotificationStatus } from "./GW_SCENES";
export declare class GW_INITIALIZE_SCENE_NTF extends GW_FRAME_NTF {
    readonly Status: InitializeSceneNotificationStatus;
    readonly FailedNodes: number[];
    constructor(Data: Buffer);
}
