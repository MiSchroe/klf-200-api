'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_CS_CONTROLLER_COPY_REQ extends common_1.GW_FRAME_REQ {
    constructor(ControllerCopyMode) {
        super(1);
        this.ControllerCopyMode = ControllerCopyMode;
        const buff = this.Data.slice(this.offset); // View on the internal buffer makes setting the data easier
        buff.writeUInt8(this.ControllerCopyMode, 0);
    }
}
exports.GW_CS_CONTROLLER_COPY_REQ = GW_CS_CONTROLLER_COPY_REQ;
//# sourceMappingURL=GW_CS_CONTROLLER_COPY_REQ.js.map