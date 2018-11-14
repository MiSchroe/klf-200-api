import { GW_FRAME_COMMAND_REQ } from "./common";
import { StatusType } from "./GW_COMMAND";
export declare class GW_STATUS_REQUEST_REQ extends GW_FRAME_COMMAND_REQ {
    readonly Nodes: number[] | number;
    readonly StatusType: StatusType;
    readonly FunctionalParameters: number[];
    constructor(Nodes: number[] | number, StatusType: StatusType, FunctionalParameters?: number[]);
    protected InitializeBuffer(): void;
}
