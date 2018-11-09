/// <reference types="node" />
import { GW_FRAME_NTF } from "./common";
import { StatusOwner, ParameterActive, RunStatus, StatusReply } from "./GW_COMMAND";
export declare class GW_COMMAND_RUN_STATUS_NTF extends GW_FRAME_NTF {
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
