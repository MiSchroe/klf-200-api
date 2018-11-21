import { GW_FRAME_REQ } from "./common";
export declare class GW_CS_REMOVE_NODES_REQ extends GW_FRAME_REQ {
    readonly Nodes: number[];
    constructor(Nodes: number[]);
}
