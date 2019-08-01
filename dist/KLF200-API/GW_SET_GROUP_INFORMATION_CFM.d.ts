import { GW_FRAME_CFM, GW_COMMON_STATUS } from "./common";
export declare class GW_SET_GROUP_INFORMATION_CFM extends GW_FRAME_CFM {
    readonly Status: GW_COMMON_STATUS;
    readonly GroupID: number;
    constructor(Data: Buffer);
    getError(): string;
}
