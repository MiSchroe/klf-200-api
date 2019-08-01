import { GW_FRAME_NTF } from "./common";
import { RunStatus, StatusReply, ParameterActive, StatusOwner } from "./GW_COMMAND";
export declare class GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF extends GW_FRAME_NTF {
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
