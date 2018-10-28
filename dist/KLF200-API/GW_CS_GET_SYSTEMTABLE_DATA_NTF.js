'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_SYSTEMTABLE_DATA_1 = require("./GW_SYSTEMTABLE_DATA");
class GW_CS_GET_SYSTEMTABLE_DATA_NTF extends common_1.GW_FRAME_NTF {
    constructor() {
        super(...arguments);
        this._numberOfEntries = -1;
        this._remainingNumberOfEntries = -1;
        this._SystemTableEntries = [];
    }
    get NumberOfEntries() {
        if (this._numberOfEntries === -1) {
            // Read number of entries from data buffer
            this._numberOfEntries = this.Data.readUInt8(0);
        }
        return this._numberOfEntries;
    }
    get RemainingNumberOfEntries() {
        if (this._remainingNumberOfEntries === -1) {
            // Read from buffer first
            const position = this.NumberOfEntries * 11 + 1;
            this._remainingNumberOfEntries = this.Data.readUInt8(position);
        }
        return this._remainingNumberOfEntries;
    }
    get SystemTableEntries() {
        if (this._SystemTableEntries.length !== this._numberOfEntries) {
            for (let entryIndex = 0; entryIndex < this.NumberOfEntries; entryIndex++) {
                const entry = new GW_SYSTEMTABLE_DATA_1.SystemTableDataEntry(this.Data.slice(entryIndex * 11 + 1, (entryIndex + 1) * 11 + 1));
                this._SystemTableEntries.push(entry);
            }
        }
        return this._SystemTableEntries;
    }
}
exports.GW_CS_GET_SYSTEMTABLE_DATA_NTF = GW_CS_GET_SYSTEMTABLE_DATA_NTF;
//# sourceMappingURL=GW_CS_GET_SYSTEMTABLE_DATA_NTF.js.map