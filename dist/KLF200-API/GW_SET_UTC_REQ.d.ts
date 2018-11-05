import { GW_FRAME_REQ } from "./common";
export declare class GW_SET_UTC_REQ extends GW_FRAME_REQ {
    readonly UTCTime: Date;
    constructor(UTCTime?: Date);
    protected InitializeBuffer(): void;
}
