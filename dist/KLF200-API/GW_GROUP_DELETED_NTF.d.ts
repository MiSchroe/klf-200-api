import { GW_FRAME_NTF } from "./common";
export declare class GW_GROUP_DELETED_NTF extends GW_FRAME_NTF {
    readonly GroupID: number;
    constructor(Data: Buffer);
}
