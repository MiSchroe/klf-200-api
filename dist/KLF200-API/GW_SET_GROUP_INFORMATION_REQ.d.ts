import { GW_FRAME_REQ } from "./common";
import { Velocity, NodeVariation } from "./GW_SYSTEMTABLE_DATA";
import { GroupType } from "./GW_GROUPS";
export declare class GW_SET_GROUP_INFORMATION_REQ extends GW_FRAME_REQ {
    readonly GroupID: number;
    readonly Revision: number;
    readonly Name: string;
    readonly GroupType: GroupType;
    readonly Nodes: number[];
    readonly Order: number;
    readonly Placement: number;
    readonly Velocity: Velocity;
    readonly NodeVariation: NodeVariation;
    constructor(GroupID: number, Revision: number, Name: string, GroupType: GroupType, Nodes: number[], Order?: number, Placement?: number, Velocity?: Velocity, NodeVariation?: NodeVariation);
    protected InitializeBuffer(): void;
}
