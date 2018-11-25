'use strict';

import { GW_FRAME_CFM } from "./common";
import { ModeStatus } from "./GW_COMMAND";

export class GW_MODE_SEND_CFM extends GW_FRAME_CFM {
    public readonly SessionID: number;
    public readonly ModeStatus: ModeStatus;

    constructor(Data: Buffer) {
        super(Data);

        this.SessionID = this.Data.readUInt16BE(0);
        this.ModeStatus = this.Data.readUInt8(2);
    }

    public getError(): string {
        switch (this.ModeStatus) {
            case ModeStatus.OK:
                throw new Error("No error.");

            case ModeStatus.CommandRejected:
                return "Command rejected.";

            case ModeStatus.UnknownClientID:
                return "Unknown client ID.";

            case ModeStatus.SessionIDInUse:
                return "Session ID in use.";

            case ModeStatus.Busy:
                return "Busy.";

            case ModeStatus.IllegalParameterValue:
                return "Invalid parameter value.";

            case ModeStatus.Failed:
                return "Failed.";
        
            default:
                return `Unknown error ${this.ModeStatus}.`;
        }
    }
}
