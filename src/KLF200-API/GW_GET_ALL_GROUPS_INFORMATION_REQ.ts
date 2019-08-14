"use strict";

import { GW_FRAME_REQ } from "./common";
import { GroupType } from "./GW_GROUPS";

export class GW_GET_ALL_GROUPS_INFORMATION_REQ extends GW_FRAME_REQ {
    constructor(GroupType?: GroupType) {
        super(2);

        if (typeof GroupType !== "undefined")
        {
            this._useFilter = true;
            this._groupType = GroupType;
            this.Data.writeUInt8(1, this.offset);
            this.Data.writeUInt8(this._groupType, this.offset + 1);
        }
    }

    private _useFilter: boolean = false;
    get UseFilter(): boolean {
        return this._useFilter;
    }

    private _groupType: GroupType = 0;
    get GroupType(): GroupType {
        return this._groupType;
    }
}