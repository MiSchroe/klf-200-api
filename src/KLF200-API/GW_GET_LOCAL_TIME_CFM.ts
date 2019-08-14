"use strict";

import { GW_FRAME_CFM } from "./common";

export enum DaylightSavingFlag {
    NotAvailable = -1,
    NotInDST = 0,
    InDST = 1
}

export class GW_GET_LOCAL_TIME_CFM extends GW_FRAME_CFM {
    public readonly UTCTime: Date;
    public readonly Second: number;
    public readonly Minute: number;
    public readonly Hour: number;
    public readonly DayOfMonth: number;
    public readonly Month: number;
    public readonly Year: number;
    public readonly Weekday: number;
    public readonly DayOfYear: number;
    public readonly DaylightSavingFlag: DaylightSavingFlag

    constructor(Data: Buffer) {
        super(Data);

        this.UTCTime = new Date(this.Data.readUInt32BE(0) * 1000);
        this.Second = this.Data.readUInt8(4);
        this.Minute = this.Data.readUInt8(5);
        this.Hour = this.Data.readUInt8(6);
        this.DayOfMonth = this.Data.readUInt8(7);
        this.Month = this.Data.readUInt8(8);
        this.Year = this.Data.readUInt16BE(9);
        this.Weekday = this.Data.readUInt8(11);
        this.DayOfYear = this.Data.readUInt16BE(12);
        this.DaylightSavingFlag = this.Data.readInt8(14);
    }
}
