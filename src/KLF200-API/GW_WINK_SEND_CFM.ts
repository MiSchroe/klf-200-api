'use strict';

import { GW_FRAME_CFM, GW_INVERSE_STATUS } from "./common";

export class GW_WINK_SEND_CFM extends GW_FRAME_CFM {
    public readonly SessionID: number;
    public readonly Status: GW_INVERSE_STATUS;

    constructor(Data: Buffer) {
        super(Data);

        this.SessionID = this.Data.readUInt16BE(0);
        this.Status = this.Data.readUInt8(2);
    }

    public getError(): string {
        switch (this.Status) {
            case GW_INVERSE_STATUS.SUCCESS:
                throw new Error("No error.");
                
            case GW_INVERSE_STATUS.ERROR:
                return "Request failed.";
        
            default:
                return `Unknown error ${this.Status}.`;
        }
    }
}
