/// <reference types="node" />
import { GW_FRAME_CFM } from "./common";
export declare enum DaylightSavingFlag {
    NotAvailable = -1,
    NotInDST = 0,
    InDST = 1
}
export declare class GW_GET_LOCAL_TIME_CFM extends GW_FRAME_CFM {
    readonly UTCTime: Date;
    readonly Second: number;
    readonly Minute: number;
    readonly Hour: number;
    readonly DayOfMonth: number;
    readonly Month: number;
    readonly Year: number;
    readonly Weekday: number;
    readonly DayOfYear: number;
    readonly DaylightSavingFlag: DaylightSavingFlag;
    constructor(Data: Buffer);
}
