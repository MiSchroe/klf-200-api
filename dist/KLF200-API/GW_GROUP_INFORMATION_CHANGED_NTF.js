'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_GROUPS_1 = require("./GW_GROUPS");
const BitArray_1 = require("../utils/BitArray");
var ChangeType;
(function (ChangeType) {
    ChangeType[ChangeType["Deleted"] = 0] = "Deleted";
    ChangeType[ChangeType["Modified"] = 1] = "Modified";
})(ChangeType = exports.ChangeType || (exports.ChangeType = {}));
class GW_GROUP_INFORMATION_CHANGED_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.ChangeType = this.Data.readUInt8(0);
        this.GroupID = this.Data.readUInt8(1);
        if (this.ChangeType === ChangeType.Modified) {
            this.Order = this.Data.readUInt16BE(2);
            this.Placement = this.Data.readUInt8(4);
            this.Name = common_1.readZString(this.Data.slice(5, 69));
            this.Velocity = this.Data.readUInt8(69);
            this.NodeVariation = this.Data.readUInt8(70);
            this.GroupType = this.Data.readUInt8(71);
            this.Revision = this.Data.readUInt16BE(98);
            if (this.GroupType === GW_GROUPS_1.GroupType.UserGroup) {
                this.Nodes = BitArray_1.bitArrayToArray(this.Data.slice(73, 98));
            }
            else {
                this.Nodes = [];
            }
        }
    }
}
exports.GW_GROUP_INFORMATION_CHANGED_NTF = GW_GROUP_INFORMATION_CHANGED_NTF;
