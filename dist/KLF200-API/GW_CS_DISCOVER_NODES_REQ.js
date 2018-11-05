'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_SYSTEMTABLE_DATA_1 = require("./GW_SYSTEMTABLE_DATA");
class GW_CS_DISCOVER_NODES_REQ extends common_1.GW_FRAME_REQ {
    constructor(NodeType = GW_SYSTEMTABLE_DATA_1.ActuatorType.NO_TYPE) {
        super();
        this.NodeType = NodeType;
        const buff = this.Data.slice(this.offset);
        buff.writeUInt8(this.NodeType, 0);
    }
    InitializeBuffer() {
        this.AllocBuffer(1);
    }
}
exports.GW_CS_DISCOVER_NODES_REQ = GW_CS_DISCOVER_NODES_REQ;
//# sourceMappingURL=GW_CS_DISCOVER_NODES_REQ.js.map