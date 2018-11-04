'use strict';

import { GW_FRAME_NTF } from "./common";
import { StatusOwner, ParameterActive, RunStatus, StatusReply, StatusType, FunctionalParameter, CommandOriginator } from "./GW_COMMAND";

export class GW_STATUS_REQUEST_NTF extends GW_FRAME_NTF {
    public readonly SessionID: number;
    public readonly StatusOwner: StatusOwner;
    public readonly NodeID: number;
    public readonly RunStatus: RunStatus;
    public readonly StatusReply: StatusReply;
    public readonly StatusType: StatusType;
    public readonly ParameterData: FunctionalParameter[] | undefined;
    public readonly TargetPosition: number | undefined;
    public readonly CurrentPosition: number | undefined;
    public readonly RemainingTime: number | undefined;
    public readonly LastMasterExecutionAddress: number | undefined;
    public readonly LastCommandOriginator: CommandOriginator | undefined;

    constructor(Data: Buffer) {
        super(Data);

        this.SessionID = this.Data.readUInt16BE(0);
        this.StatusOwner = this.Data.readUInt8(2);
        this.NodeID = this.Data.readUInt8(3);
        this.RunStatus = this.Data.readUInt8(4);
        this.StatusReply = this.Data.readUInt8(5);
        this.StatusType = this.Data.readUInt8(6);

        switch (this.StatusType) {
            case StatusType.RequestMainInfo:
                this.TargetPosition = this.Data.readUInt16BE(7);
                this.CurrentPosition = this.Data.readUInt16BE(9);
                this.RemainingTime = this.Data.readUInt16BE(11);
                this.LastMasterExecutionAddress = this.Data.readUInt32BE(13);
                this.LastCommandOriginator = this.Data.readUInt8(17);
                break;

            case StatusType.RequestTargetPosition:
            case StatusType.RequestCurrentPosition:
            case StatusType.RequestRemainingTime:
                const statusCount = this.Data.readUInt8(7);
                this.ParameterData = [];
                for (let statusIndex = 0; statusIndex < statusCount; statusIndex++) {
                    this.ParameterData.push({
                        ID: this.Data.readUInt8(statusIndex * 3 + 8),
                        Value: this.Data.readUInt16BE(statusIndex * 3 + 9)
                    });
                }
                break;
        
            default:
                throw "Unknown StatusType.";
        }
    }
}
