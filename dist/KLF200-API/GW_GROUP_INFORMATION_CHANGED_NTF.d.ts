/// <reference types="node" />
import { GW_FRAME_NTF } from "./common";
import { GroupType } from "./GW_GROUPS";
import { Velocity, NodeVariation } from "./GW_SYSTEMTABLE_DATA";
export declare enum ChangeType {
    Deleted = 0,
    Modified = 1
}
export declare class GW_GROUP_INFORMATION_CHANGED_NTF extends GW_FRAME_NTF {
    readonly GroupID: number;
    readonly ChangeType: ChangeType;
    readonly Order: number | undefined;
    readonly Placement: number | undefined;
    readonly Name: string | undefined;
    readonly Velocity: Velocity | undefined;
    readonly NodeVariation: NodeVariation | undefined;
    readonly GroupType: GroupType | undefined;
    readonly Nodes: number[] | undefined;
    readonly Revision: number | undefined;
    constructor(Data: Buffer);
}
