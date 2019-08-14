"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_SET_UTC_REQ extends common_1.GW_FRAME_REQ {
    constructor(UTCTime = new Date()) {
        super(4);
        this.UTCTime = UTCTime;
        const buff = this.Data.slice(this.offset); // View on the internal buffer makes setting the data easier
        buff.writeUInt32BE(UTCTime.valueOf() / 1000, 0);
    }
}
exports.GW_SET_UTC_REQ = GW_SET_UTC_REQ;
//# sourceMappingURL=GW_SET_UTC_REQ.js.map