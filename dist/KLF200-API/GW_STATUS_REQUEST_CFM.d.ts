/// <reference types="node" />
import { GW_FRAME_CFM } from "./common";
import { CommandStatus } from "./GW_COMMAND";
export declare class GW_STATUS_REQUEST_CFM extends GW_FRAME_CFM {
    readonly SessionID: number;
    readonly CommandStatus: CommandStatus;
    constructor(Data: Buffer);
}
