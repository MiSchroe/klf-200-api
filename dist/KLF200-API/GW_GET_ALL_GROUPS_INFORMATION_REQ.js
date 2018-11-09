'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GET_ALL_GROUPS_INFORMATION_REQ extends common_1.GW_FRAME_REQ {
    constructor(GroupType) {
        super();
        this._useFilter = false;
        this._groupType = 0;
        if (typeof GroupType !== "undefined") {
            this._useFilter = true;
            this._groupType = GroupType;
            this.Data.writeUInt8(1, this.offset);
            this.Data.writeUInt8(this._groupType, this.offset + 1);
        }
    }
    InitializeBuffer() {
        this.AllocBuffer(2);
    }
    get UseFilter() {
        return this._useFilter;
    }
    get GroupType() {
        return this._groupType;
    }
}
exports.GW_GET_ALL_GROUPS_INFORMATION_REQ = GW_GET_ALL_GROUPS_INFORMATION_REQ;
//# sourceMappingURL=GW_GET_ALL_GROUPS_INFORMATION_REQ.js.map