import { GW_FRAME_REQ } from "./common";
export declare class GW_DELETE_GROUP_REQ extends GW_FRAME_REQ {
    readonly GroupID: number;
    constructor(GroupID: number);
    protected InitializeBuffer(): void;
}
