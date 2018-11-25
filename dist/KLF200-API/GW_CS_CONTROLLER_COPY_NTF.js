'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_CS_CONTROLLER_COPY_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.ControllerCopyMode = this.Data.readUInt8(0);
        this.ControllerCopyStatus = this.Data.readUInt8(1);
    }
}
exports.GW_CS_CONTROLLER_COPY_NTF = GW_CS_CONTROLLER_COPY_NTF;
