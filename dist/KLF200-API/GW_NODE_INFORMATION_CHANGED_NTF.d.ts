/// <reference types="node" />
import { GW_FRAME_NTF } from "./common";
import { NodeVariation } from "./GW_SYSTEMTABLE_DATA";
export declare class GW_NODE_INFORMATION_CHANGED_NTF extends GW_FRAME_NTF {
    readonly NodeID: number;
    readonly Order: number;
    readonly Placement: number;
    readonly Name: string;
    readonly NodeVariation: NodeVariation;
    constructor(Data: Buffer);
}
