import { GW_FRAME_CFM } from "./common";
export declare class GW_GET_PROTOCOL_VERSION_CFM extends GW_FRAME_CFM {
    readonly MajorVersion: number;
    readonly MinorVersion: number;
    constructor(Data: Buffer);
}
