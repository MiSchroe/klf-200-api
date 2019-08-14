"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const BitArray_1 = require("../utils/BitArray");
var DiscoverStatus;
(function (DiscoverStatus) {
    DiscoverStatus[DiscoverStatus["OK"] = 0] = "OK";
    DiscoverStatus[DiscoverStatus["Failed"] = 5] = "Failed";
    DiscoverStatus[DiscoverStatus["PartialOK"] = 6] = "PartialOK";
    DiscoverStatus[DiscoverStatus["Busy"] = 7] = "Busy";
})(DiscoverStatus = exports.DiscoverStatus || (exports.DiscoverStatus = {}));
class GW_CS_DISCOVER_NODES_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.AddedNodes = BitArray_1.bitArrayToArray(this.Data.slice(0, 26));
        this.RFConnectionErrorNodes = BitArray_1.bitArrayToArray(this.Data.slice(26, 52));
        this.ioKeyErrorExistingNodes = BitArray_1.bitArrayToArray(this.Data.slice(52, 78));
        this.RemovedNodes = BitArray_1.bitArrayToArray(this.Data.slice(78, 104));
        this.OpenNodes = BitArray_1.bitArrayToArray(this.Data.slice(104, 130));
        this.DiscoverStatus = this.Data.readUInt8(130);
    }
}
exports.GW_CS_DISCOVER_NODES_NTF = GW_CS_DISCOVER_NODES_NTF;
//# sourceMappingURL=GW_CS_DISCOVER_NODES_NTF.js.map