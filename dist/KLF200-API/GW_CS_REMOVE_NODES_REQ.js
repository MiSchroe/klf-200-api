'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const BitArray_1 = require("../utils/BitArray");
class GW_CS_REMOVE_NODES_REQ extends common_1.GW_FRAME_REQ {
    constructor(Nodes) {
        super(26);
        this.Nodes = Nodes;
        const buff = this.Data.slice(this.offset); // View on the internal buffer makes setting the data easier
        BitArray_1.arrayToBitArray(this.Nodes, 26, buff);
    }
}
exports.GW_CS_REMOVE_NODES_REQ = GW_CS_REMOVE_NODES_REQ;
//# sourceMappingURL=GW_CS_REMOVE_NODES_REQ.js.map