"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_WINK_SEND_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.SessionID = this.Data.readUInt16BE(0);
    }
}
exports.GW_WINK_SEND_NTF = GW_WINK_SEND_NTF;
//# sourceMappingURL=GW_WINK_SEND_NTF.js.map