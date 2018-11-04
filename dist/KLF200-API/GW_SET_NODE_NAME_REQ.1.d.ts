import { GW_FRAME_REQ } from "./common";
export declare class GW_SET_NODE_NAME_REQ extends GW_FRAME_REQ {
    readonly NodeID: number;
    readonly Name: string;
    constructor(NodeID: number, Name: string);
    protected InitializeBuffer(): void;
}
