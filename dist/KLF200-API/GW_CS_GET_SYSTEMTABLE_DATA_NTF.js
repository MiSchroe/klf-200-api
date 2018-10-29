'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_SYSTEMTABLE_DATA_1 = require("./GW_SYSTEMTABLE_DATA");
class GW_CS_GET_SYSTEMTABLE_DATA_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.SystemTableEntries = [];
        // Read number of entries from data buffer
        this.NumberOfEntries = this.Data.readUInt8(0);
        // Read number of remaining entries from buffer
        const position = this.NumberOfEntries * 11 + 1;
        this.RemainingNumberOfEntries = this.Data.readUInt8(position);
        // Read system table data entries
        for (let entryIndex = 0; entryIndex < this.NumberOfEntries; entryIndex++) {
            const entry = new GW_SYSTEMTABLE_DATA_1.SystemTableDataEntry(this.Data.slice(entryIndex * 11 + 1, (entryIndex + 1) * 11 + 1));
            this.SystemTableEntries.push(entry);
        }
    }
}
exports.GW_CS_GET_SYSTEMTABLE_DATA_NTF = GW_CS_GET_SYSTEMTABLE_DATA_NTF;
//# sourceMappingURL=GW_CS_GET_SYSTEMTABLE_DATA_NTF.js.map