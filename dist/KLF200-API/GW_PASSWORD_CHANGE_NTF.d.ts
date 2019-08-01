import { GW_FRAME_NTF } from "./common";
export declare class GW_PASSWORD_CHANGE_NTF extends GW_FRAME_NTF {
    readonly NewPassword: string;
    constructor(Data: Buffer);
}
