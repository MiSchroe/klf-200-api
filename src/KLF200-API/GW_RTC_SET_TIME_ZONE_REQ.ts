"use strict";

import { GW_FRAME_REQ } from "./common";

export class GW_RTC_SET_TIME_ZONE_REQ extends GW_FRAME_REQ {
    // /**
    //  * Creates an instance of GW_RTC_SET_TIME_ZONE_REQ.
    //  * 
    //  * @param {string} [TimeZoneName="localtime"] Time zone name, e.g. IANA time zones. See https://github.com/SpiritIT/timezonecomplete/blob/master/doc/API.md for further information.
    //  * @memberof GW_RTC_SET_TIME_ZONE_REQ
    //  */
    // constructor(readonly TimeZoneName: string = "localtime") {
    //     super();

    //     const buff = this.Data.slice(this.offset);  // View on the internal buffer makes setting the data easier
    //     // let timeZoneString = "";
        
    //     // // Get the time zone data
    //     // const tz = TimeZone.zone(this.TimeZoneName);
    //     // const Jan1st = DateTime.now(tz).startOfYear();
    //     // const currentYear = Jan1st.year();
    //     // if (tz.kind() !== TimeZoneKind.Proper) {
    //     //     timeZoneString += `:${Jan1st.format("O")}`;
    //     // }
    //     // else if (!tz.hasDst()) {
    //     //     // No daylight saving time at all -> simple offset
    //     //     timeZoneString += `:${Jan1st.format("O")}`;
    //     // }
    //     // else {
    //     //     const tzwoDST = TimeZone.zone(this.TimeZoneName, false);    // Time zone without DST -> if offsets for Jan, 1st are the same, then we are on northern hemisphere -> 2 entries, else 3 entries
    //     //     const startsWithRegularTime = tz.offsetForZone(currentYear, 1, 1, 0, 0, 0, 0) === tzwoDST.offsetForZone(currentYear, 1, 1, 0, 0, 0, 0);
    //     //     const transitions = TzDatabase.instance().getTransitionsTotalOffsets(this.TimeZoneName, currentYear, currentYear + 1);  // Get DST transitions for the current and the next year
    //     //     if (transitions.length > 0 && new DateTime(transitions[0].at).year() < currentYear) {
    //     //         transitions.shift();
    //     //     }
    //     //     if (startsWithRegularTime) {
    //     //         const atDate = new DateTime(transitions[0].at, tz);
    //     //         timeZoneString += `:${Jan1st.format("O")}:${atDate.format("O")}:${Jan1st.offset}`;
    //     //         let isDST = true;
    //     //         transitions.forEach(transition => {
    //     //             // Write DST entries
    //     //             const atDate = new DateTime(transition.at, tz);
    //     //             let atDateUnspecific = atDate.withZone(undefined);
    //     //             if (isDST)
    //     //             {
    //     //                 atDateUnspecific = atDateUnspecific.sub(1, TimeUnit.Hour);
    //     //             }
    //     //             isDST = !isDST;
    //     //             timeZoneString += `:${atDateUnspecific.format(":(yyyy)MMddHH")}`
    //     //         });
    //     //     }
    //     //     else {
    //     //         const atDate = new DateTime(transitions[0].at, tz);
    //     //         timeZoneString += `:${atDate.format("O")}:${Jan1st.format("O")}:${atDate.offset}:(${currentYear})010100`;
    //     //         let isDST = false;
    //     //         transitions.forEach(transition => {
    //     //             // Write DST entries
    //     //             const atDate = new DateTime(transition.at, tz);
    //     //             let atDateUnspecific = atDate.withZone(undefined);
    //     //             if (isDST)
    //     //             {
    //     //                 atDateUnspecific = atDateUnspecific.sub(1, TimeUnit.Hour);
    //     //             }
    //     //             isDST = !isDST;
    //     //             timeZoneString += `:${atDateUnspecific.format(":MMddHH")}`
    //     //         });
    //     //     }
    //     // }

    //     // // Write resulting time zone string
    //     // buff.write(timeZoneString, 0, 64, "utf8");
    //     buff.write(TimeZoneName, 0, 64, "utf8");
    // }

    /**
     * Creates an instance of GW_RTC_SET_TIME_ZONE_REQ.
     * 
     * @param {string} [TimeZoneString] Time zone string, e.g. :GMT+1:GMT+2:0060:(1996)040102-0:110102-0
     * @memberof GW_RTC_SET_TIME_ZONE_REQ
     */
    constructor(readonly TimeZoneString: string) {
        super(64);

        const buff = this.Data.slice(this.offset);  // View on the internal buffer makes setting the data easier
        buff.write(TimeZoneString, 0, 64, "utf8");
    }
}