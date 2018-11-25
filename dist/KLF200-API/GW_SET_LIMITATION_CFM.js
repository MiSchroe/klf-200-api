'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_SET_LIMITATION_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.SessionID = this.Data.readUInt16BE(0);
        this.Status = this.Data.readUInt8(2);
    }
    getError() {
        switch (this.Status) {
            case common_1.GW_INVERSE_STATUS.SUCCESS:
                throw new Error("No error.");
            case common_1.GW_INVERSE_STATUS.ERROR:
                return "Request failed.";
            default:
                return `Unknown error ${this.Status}.`;
        }
    }
}
exports.GW_SET_LIMITATION_CFM = GW_SET_LIMITATION_CFM;
//# sourceMappingURL=GW_SET_LIMITATION_CFM.js.map