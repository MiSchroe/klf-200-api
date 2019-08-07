/// <reference types="node" />
import { GW_FRAME_CFM } from "./common";
export declare class SoftwareVersion {
    readonly CommandVersion: number;
    readonly MainVersion: number;
    readonly SubVersion: number;
    readonly BranchID: number;
    readonly Build: number;
    readonly MicroBuild: number;
    constructor(CommandVersion: number, MainVersion: number, SubVersion: number, BranchID: number, Build: number, MicroBuild: number);
    toString(): string;
}
export declare class GW_GET_VERSION_CFM extends GW_FRAME_CFM {
    readonly SoftwareVersion: SoftwareVersion;
    readonly HardwareVersion: number;
    readonly ProductGroup: number;
    readonly ProductType: number;
    constructor(Data: Buffer);
}
