import { GW_FRAME_REQ } from "./common";
export declare class GW_SET_NODE_ORDER_AND_PLACEMENT_REQ extends GW_FRAME_REQ {
    readonly NodeID: number;
    readonly Order: number;
    readonly Placement: number;
    constructor(NodeID: number, Order: number, Placement: number);
    protected InitializeBuffer(): void;
}
