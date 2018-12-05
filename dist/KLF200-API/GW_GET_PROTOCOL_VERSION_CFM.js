'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GET_PROTOCOL_VERSION_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.MajorVersion = this.Data.readUInt16BE(0);
        this.MinorVersion = this.Data.readUInt16BE(2);
    }
}
exports.GW_GET_PROTOCOL_VERSION_CFM = GW_GET_PROTOCOL_VERSION_CFM;
//# sourceMappingURL=GW_GET_PROTOCOL_VERSION_CFM.js.map