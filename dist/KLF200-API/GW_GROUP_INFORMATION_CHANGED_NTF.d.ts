import { GW_FRAME_NTF } from "./common";
import { GroupType } from "./GW_GROUPS";
import { Velocity, NodeVariation } from "./GW_SYSTEMTABLE_DATA";
export declare enum ChangeType {
    Deleted = 0,
    Modified = 1
}
export interface GW_GROUP_INFORMATION_CHANGED_NTF_Deleted {
    readonly ChangeType: ChangeType.Deleted;
    readonly GroupID: number;
}
export interface GW_GROUP_INFORMATION_CHANGED_NTF_Modified {
    readonly ChangeType: ChangeType.Modified;
    readonly GroupID: number;
    readonly Order: number;
    readonly Placement: number;
    readonly Name: string;
    readonly Velocity: Velocity;
    readonly NodeVariation: NodeVariation;
    readonly GroupType: GroupType;
    readonly Nodes: number[];
    readonly Revision: number;
}
export declare class GW_GROUP_INFORMATION_CHANGED_NTF extends GW_FRAME_NTF {
    readonly GroupID: number;
    readonly ChangeType: ChangeType;
    readonly Order?: number;
    readonly Placement?: number;
    readonly Name?: string;
    readonly Velocity?: Velocity;
    readonly NodeVariation?: NodeVariation;
    readonly GroupType?: GroupType;
    readonly Nodes?: number[];
    readonly Revision?: number;
    constructor(Data: Buffer);
}
