import { GW_FRAME_REQ } from "./common";
export declare class GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ extends GW_FRAME_REQ {
    readonly TimeStamp: Date;
    constructor(TimeStamp: Date);
    protected InitializeBuffer(): void;
}
