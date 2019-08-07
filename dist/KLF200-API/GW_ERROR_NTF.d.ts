/// <reference types="node" />
import { GW_FRAME_NTF } from "./common";
export declare enum GW_ERROR {
    NotFurtherDefined = 0,
    UnknownCommand = 1,
    InvalidFrameStructure = 2,
    Busy = 7,
    InvalidSystemTableIndex = 8,
    NotAuthenticated = 12,
    UnknonwErrorCode = 255
}
export declare class GW_ERROR_NTF extends GW_FRAME_NTF {
    readonly ErrorNumber: GW_ERROR;
    constructor(Data: Buffer);
    getError(): string;
}
