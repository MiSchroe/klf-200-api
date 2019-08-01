import { GW_FRAME_NTF } from "./common";
export declare class GW_WINK_SEND_NTF extends GW_FRAME_NTF {
    readonly SessionID: number;
    constructor(Data: Buffer);
}
