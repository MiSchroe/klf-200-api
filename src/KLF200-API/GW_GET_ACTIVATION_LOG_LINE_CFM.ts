'use strict';

import { GW_FRAME_CFM } from "./common";
import { RunStatus, StatusReply, ParameterActive, StatusOwner } from "./GW_COMMAND";

export class GW_GET_ACTIVATION_LOG_LINE_CFM extends GW_FRAME_CFM {
    public readonly TimeStamp: Date;
    public readonly SessionID: number;
    public readonly StatusOwner: StatusOwner;
    public readonly NodeID: number;
    public readonly NodeParameter: ParameterActive;
    public readonly ParameterValue: number;
    public readonly RunStatus: RunStatus;
    public readonly StatusReply: StatusReply;
    public readonly InformationCode: number;
    
    constructor(Data: Buffer) {
        super(Data);

        this.TimeStamp = new Date(this.Data.readUInt32BE(0));
        this.SessionID = this.Data.readUInt16BE(4);
        this.StatusOwner = this.Data.readUInt8(6);
        this.NodeID = this.Data.readUInt8(7);
        this.NodeParameter = this.Data.readUInt8(8);
        this.ParameterValue = this.Data.readUInt16BE(9);
        this.RunStatus = this.Data.readUInt8(11);
        this.StatusReply = this.Data.readUInt8(12);
        this.InformationCode = this.Data.readUInt32BE(13);
    }
}
