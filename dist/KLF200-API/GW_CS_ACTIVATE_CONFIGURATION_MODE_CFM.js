'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const BitArray_1 = require("../utils/BitArray");
class GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.ActivatedNodes = BitArray_1.bitArrayToArray(this.Data.slice(0, 26));
        this.NoContactNodes = BitArray_1.bitArrayToArray(this.Data.slice(26, 52));
        this.OtherErrorNodes = BitArray_1.bitArrayToArray(this.Data.slice(52, 78));
        this.Status = this.Data.readUInt8(78);
    }
    getError() {
        switch (this.Status) {
            case 0:
                throw new Error("No error.");
            default:
                return `Error code ${this.Status.toString()}.`;
        }
    }
}
exports.GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM = GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM;
