'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_LIMITATION_STATUS_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.SessionID = this.Data.readUInt16BE(0);
        this.NodeID = this.Data.readUInt8(2);
        this.ParameterID = this.Data.readUInt8(3);
        this.LimitationValueMin = this.Data.readUInt16BE(4);
        this.LimitationValueMax = this.Data.readUInt16BE(6);
        this.LimitationOriginator = this.Data.readUInt8(8);
        this.LimitationTime = this.Data.readUInt8(9);
    }
}
exports.GW_LIMITATION_STATUS_NTF = GW_LIMITATION_STATUS_NTF;
//# sourceMappingURL=GW_LIMITATION_STATUS_NTF.js.map