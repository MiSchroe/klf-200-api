/// <reference types="node" />
import { GW_FRAME_NTF } from "./common";
import { ChangeKeyStatus } from "./GW_SYSTEMTABLE_DATA";
export declare class GW_CS_RECEIVE_KEY_NTF extends GW_FRAME_NTF {
    readonly ChangeKeyStatus: ChangeKeyStatus;
    readonly KeyChangedNodes: number[];
    readonly KeyNotChangedNodes: number[];
    constructor(Data: Buffer);
}
