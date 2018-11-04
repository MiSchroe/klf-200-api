import { GW_FRAME_REQ } from "./common";
import { Velocity } from "./GW_SYSTEMTABLE_DATA";
export declare class GW_SET_NODE_VELOCITY_REQ extends GW_FRAME_REQ {
    readonly NodeID: number;
    readonly Velocity: Velocity;
    constructor(NodeID: number, Velocity: Velocity);
    protected InitializeBuffer(): void;
}
