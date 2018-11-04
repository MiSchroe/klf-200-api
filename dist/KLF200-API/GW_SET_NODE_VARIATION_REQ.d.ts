import { GW_FRAME_REQ } from "./common";
import { NodeVariation } from "./GW_SYSTEMTABLE_DATA";
export declare class GW_SET_NODE_VARIATION_REQ extends GW_FRAME_REQ {
    readonly NodeID: number;
    readonly NodeVariation: NodeVariation;
    constructor(NodeID: number, NodeVariation?: NodeVariation);
    protected InitializeBuffer(): void;
}
