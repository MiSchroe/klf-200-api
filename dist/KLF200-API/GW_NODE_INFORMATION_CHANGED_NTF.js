'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_NODE_INFORMATION_CHANGED_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.NodeID = this.Data.readUInt8(0);
        this.Name = common_1.readZString(this.Data.slice(1, 65));
        this.Order = this.Data.readUInt16BE(65);
        this.Placement = this.Data.readUInt8(67);
        this.NodeVariation = this.Data.readUInt8(68);
    }
}
exports.GW_NODE_INFORMATION_CHANGED_NTF = GW_NODE_INFORMATION_CHANGED_NTF;
