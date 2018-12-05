'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_SESSION_FINISHED_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.SessionID = this.Data.readUInt16BE(0);
    }
}
exports.GW_SESSION_FINISHED_NTF = GW_SESSION_FINISHED_NTF;
//# sourceMappingURL=GW_SESSION_FINISHED_NTF.js.map