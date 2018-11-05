import { GW_FRAME_REQ } from "./common";
export declare class GW_RTC_SET_TIME_ZONE_REQ extends GW_FRAME_REQ {
    readonly TimeZoneString: string;
    /**
     * Creates an instance of GW_RTC_SET_TIME_ZONE_REQ.
     *
     * @param {string} [TimeZoneString] Time zone string, e.g. :GMT+1:GMT+2:0060:(1996)040102-0:110102-0
     * @memberof GW_RTC_SET_TIME_ZONE_REQ
     */
    constructor(TimeZoneString: string);
    protected InitializeBuffer(): void;
}
