/// <reference types="node" />
import { GW_FRAME_NTF } from "./common";
export declare class GW_CS_SYSTEM_TABLE_UPDATE_NTF extends GW_FRAME_NTF {
    readonly AddedNodes: number[];
    readonly RemovedNodes: number[];
    constructor(Data: Buffer);
}
