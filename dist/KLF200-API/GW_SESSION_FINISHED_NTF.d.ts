import { GW_FRAME_NTF } from "./common";
export declare class GW_SESSION_FINISHED_NTF extends GW_FRAME_NTF {
    readonly SessionID: number;
    constructor(Data: Buffer);
}
