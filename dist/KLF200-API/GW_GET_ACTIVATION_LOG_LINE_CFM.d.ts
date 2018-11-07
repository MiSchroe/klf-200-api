/// <reference types="node" />
import { GW_FRAME_CFM } from "./common";
import { RunStatus, StatusReply, ParameterActive, StatusOwner } from "./GW_COMMAND";
export declare class GW_GET_ACTIVATION_LOG_LINE_CFM extends GW_FRAME_CFM {
    readonly TimeStamp: Date;
    readonly SessionID: number;
    readonly StatusOwner: StatusOwner;
    readonly NodeID: number;
    readonly NodeParameter: ParameterActive;
    readonly ParameterValue: number;
    readonly RunStatus: RunStatus;
    readonly StatusReply: StatusReply;
    readonly InformationCode: number;
    constructor(Data: Buffer);
}
