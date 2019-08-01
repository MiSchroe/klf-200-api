import { GW_FRAME_CFM, GW_COMMON_STATUS } from "./common";
export declare class GW_DELETE_GROUP_CFM extends GW_FRAME_CFM {
    readonly GroupID: number;
    readonly Status: GW_COMMON_STATUS;
    constructor(Data: Buffer);
    getError(): string;
}
