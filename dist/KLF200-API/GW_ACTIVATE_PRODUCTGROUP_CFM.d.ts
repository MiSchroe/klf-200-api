import { GW_FRAME_CFM } from "./common";
import { ActivateProductGroupStatus } from "./GW_COMMAND";
export declare class GW_ACTIVATE_PRODUCTGROUP_CFM extends GW_FRAME_CFM {
    readonly SessionID: number;
    readonly Status: ActivateProductGroupStatus;
    constructor(Data: Buffer);
    getError(): string;
}
