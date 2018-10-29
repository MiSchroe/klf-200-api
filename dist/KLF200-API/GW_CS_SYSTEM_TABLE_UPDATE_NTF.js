'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_CS_SYSTEM_TABLE_UPDATE_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.AddedNodes = [];
        this.RemovedNodes = [];
        // Added nodes
        for (let index = 0; index < 26; index++) {
            let addedNodeByte = this.Data.readUInt8(index);
            if (addedNodeByte !== 0) {
                // Check bits
                for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
                    if ((addedNodeByte & 0x01) === 0x01) {
                        this.AddedNodes.push(index * 8 + bitIndex);
                    }
                    addedNodeByte = addedNodeByte >>> 1; // shift one bit
                }
            }
        }
        // Removed nodes
        for (let index = 0; index < 26; index++) {
            let removedNodeByte = this.Data.readUInt8(index + 26);
            if (removedNodeByte !== 0) {
                // Check bits
                for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
                    if ((removedNodeByte & 0x01) === 0x01) {
                        this.RemovedNodes.push(index * 8 + bitIndex);
                    }
                    removedNodeByte = removedNodeByte >>> 1; // shift one bit
                }
            }
        }
    }
}
exports.GW_CS_SYSTEM_TABLE_UPDATE_NTF = GW_CS_SYSTEM_TABLE_UPDATE_NTF;
//# sourceMappingURL=GW_CS_SYSTEM_TABLE_UPDATE_NTF.js.map