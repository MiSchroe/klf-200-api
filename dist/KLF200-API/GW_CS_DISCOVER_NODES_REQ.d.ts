import { GW_FRAME_REQ } from "./common";
import { ActuatorType } from "./GW_SYSTEMTABLE_DATA";
export declare class GW_CS_DISCOVER_NODES_REQ extends GW_FRAME_REQ {
    readonly NodeType: ActuatorType;
    constructor(NodeType?: ActuatorType);
    protected InitializeBuffer(): void;
}
