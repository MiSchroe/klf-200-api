'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
var DaylightSavingFlag;
(function (DaylightSavingFlag) {
    DaylightSavingFlag[DaylightSavingFlag["NotAvailable"] = -1] = "NotAvailable";
    DaylightSavingFlag[DaylightSavingFlag["NotInDST"] = 0] = "NotInDST";
    DaylightSavingFlag[DaylightSavingFlag["InDST"] = 1] = "InDST";
})(DaylightSavingFlag = exports.DaylightSavingFlag || (exports.DaylightSavingFlag = {}));
class GW_GET_LOCAL_TIME_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.UTCTime = new Date(this.Data.readUInt32BE(0) * 1000);
        this.Second = this.Data.readUInt8(4);
        this.Minute = this.Data.readUInt8(5);
        this.Hour = this.Data.readUInt8(6);
        this.DayOfMonth = this.Data.readUInt8(7);
        this.Month = this.Data.readUInt8(8);
        this.Year = this.Data.readUInt16BE(9);
        this.Weekday = this.Data.readUInt8(11);
        this.DayOfYear = this.Data.readUInt8(12);
        this.DaylightSavingFlag = this.Data.readInt8(14);
    }
}
exports.GW_GET_LOCAL_TIME_CFM = GW_GET_LOCAL_TIME_CFM;
//# sourceMappingURL=GW_GET_LOCAL_TIME_CFM.js.map