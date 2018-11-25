'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const BitArray_1 = require("../utils/BitArray");
class GW_CS_SYSTEM_TABLE_UPDATE_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        // Added nodes
        this.AddedNodes = BitArray_1.bitArrayToArray(this.Data.slice(0, 26));
        // Removed nodes
        this.RemovedNodes = BitArray_1.bitArrayToArray(this.Data.slice(26, 52));
    }
}
exports.GW_CS_SYSTEM_TABLE_UPDATE_NTF = GW_CS_SYSTEM_TABLE_UPDATE_NTF;
