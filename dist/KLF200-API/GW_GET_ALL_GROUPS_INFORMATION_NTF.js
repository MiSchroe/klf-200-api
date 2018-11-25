'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_GROUPS_1 = require("./GW_GROUPS");
const BitArray_1 = require("../utils/BitArray");
class GW_GET_ALL_GROUPS_INFORMATION_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.GroupID = this.Data.readUInt8(0);
        this.Order = this.Data.readUInt16BE(1);
        this.Placement = this.Data.readUInt8(3);
        this.Name = common_1.readZString(this.Data.slice(4, 68));
        this.Velocity = this.Data.readUInt8(68);
        this.NodeVariation = this.Data.readUInt8(69);
        this.GroupType = this.Data.readUInt8(70);
        this.Revision = this.Data.readUInt16BE(97);
        if ([GW_GROUPS_1.GroupType.UserGroup, GW_GROUPS_1.GroupType.All].indexOf(this.GroupType) !== -1) {
            this.Nodes = BitArray_1.bitArrayToArray(this.Data.slice(72, 97));
        }
        else {
            this.Nodes = [];
        }
    }
}
exports.GW_GET_ALL_GROUPS_INFORMATION_NTF = GW_GET_ALL_GROUPS_INFORMATION_NTF;
