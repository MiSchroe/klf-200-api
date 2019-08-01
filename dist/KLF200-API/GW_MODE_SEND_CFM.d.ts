import { GW_FRAME_CFM } from "./common";
import { ModeStatus } from "./GW_COMMAND";
export declare class GW_MODE_SEND_CFM extends GW_FRAME_CFM {
    readonly SessionID: number;
    readonly ModeStatus: ModeStatus;
    constructor(Data: Buffer);
    getError(): string;
}
