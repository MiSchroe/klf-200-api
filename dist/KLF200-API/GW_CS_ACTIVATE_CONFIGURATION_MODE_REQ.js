"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const BitArray_1 = require("../utils/BitArray");
class GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ extends common_1.GW_FRAME_REQ {
    constructor(ActivateConfigurationNodes) {
        super(26);
        this.ActivateConfigurationNodes = ActivateConfigurationNodes;
        const buff = this.Data.slice(this.offset);
        BitArray_1.arrayToBitArray(this.ActivateConfigurationNodes, 26, buff);
    }
}
exports.GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ = GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ;
//# sourceMappingURL=GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ.js.map