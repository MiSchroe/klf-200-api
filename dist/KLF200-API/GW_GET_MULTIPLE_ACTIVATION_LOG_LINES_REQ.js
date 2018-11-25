'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ extends common_1.GW_FRAME_REQ {
    constructor(TimeStamp) {
        super(4);
        this.TimeStamp = TimeStamp;
        const buff = this.Data.slice(this.offset);
        buff.writeUInt32BE(this.TimeStamp.valueOf() / 1000, 0);
    }
}
exports.GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ = GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ;
