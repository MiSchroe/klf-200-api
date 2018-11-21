import { GW_FRAME_REQ } from "./common";
export declare class GW_GET_NODE_INFORMATION_REQ extends GW_FRAME_REQ {
    readonly NodeID: number;
    constructor(NodeID: number);
}
