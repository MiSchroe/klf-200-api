/// <reference types="node" />
import { GW_FRAME_NTF } from "./common";
import { ControllerCopyMode } from "./GW_SYSTEMTABLE_DATA";
export declare class GW_CS_CONTROLLER_COPY_NTF extends GW_FRAME_NTF {
    readonly ControllerCopyMode: ControllerCopyMode;
    readonly ControllerCopyStatus: number;
    constructor(Data: Buffer);
}
