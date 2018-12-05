'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GET_SCENE_INFORMATION_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.Nodes = [];
        this.SceneID = this.Data.readUInt8(0);
        this.Name = common_1.readZString(this.Data.slice(1, 65));
        this.NumberOfNodes = this.Data.readUInt8(65);
        this.NumberOfRemainingNodes = this.Data.readUInt8(this.NumberOfNodes * 4 + 66);
        for (let nodeIndex = 0; nodeIndex < this.NumberOfNodes; nodeIndex++) {
            this.Nodes.push({
                NodeID: this.Data.readUInt8(nodeIndex * 4 + 66),
                ParameterID: this.Data.readUInt8(nodeIndex * 4 + 67),
                ParameterValue: this.Data.readUInt16BE(nodeIndex * 4 + 68)
            });
        }
    }
}
exports.GW_GET_SCENE_INFORMATION_NTF = GW_GET_SCENE_INFORMATION_NTF;
//# sourceMappingURL=GW_GET_SCENE_INFORMATION_NTF.js.map