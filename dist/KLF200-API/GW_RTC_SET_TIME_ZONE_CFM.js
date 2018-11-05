'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_RTC_SET_TIME_ZONE_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.Status = this.Data.readUInt8(0);
    }
}
exports.GW_RTC_SET_TIME_ZONE_CFM = GW_RTC_SET_TIME_ZONE_CFM;
//# sourceMappingURL=GW_RTC_SET_TIME_ZONE_CFM.js.map