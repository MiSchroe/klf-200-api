'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const BitArray_1 = require("../utils/BitArray");
class GW_CS_RECEIVE_KEY_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.ChangeKeyStatus = this.Data.readUInt8(0);
        this.KeyChangedNodes = BitArray_1.bitArrayToArray(this.Data.slice(1, 27));
        this.KeyNotChangedNodes = BitArray_1.bitArrayToArray(this.Data.slice(27, 53));
    }
}
exports.GW_CS_RECEIVE_KEY_NTF = GW_CS_RECEIVE_KEY_NTF;
