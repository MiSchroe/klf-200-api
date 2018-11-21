import { GW_FRAME_REQ } from "./common";
import { GroupType } from "./GW_GROUPS";
export declare class GW_GET_ALL_GROUPS_INFORMATION_REQ extends GW_FRAME_REQ {
    constructor(GroupType?: GroupType);
    private _useFilter;
    readonly UseFilter: boolean;
    private _groupType;
    readonly GroupType: GroupType;
}
