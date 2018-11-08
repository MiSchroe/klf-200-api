'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_RENAME_SCENE_REQ extends common_1.GW_FRAME_REQ {
    constructor(SceneID, Name) {
        super();
        this.SceneID = SceneID;
        this.Name = Name;
        if (Buffer.from(this.Name).byteLength > 64)
            throw "Name too long.";
        const buff = this.Data.slice(this.offset);
        buff.writeUInt8(this.SceneID, 0);
        // Fill the name part with spaces first:
        // buff.slice(1, 66).fill(" ");
        buff.write(this.Name, 1);
    }
    InitializeBuffer() {
        this.AllocBuffer(65);
    }
}
exports.GW_RENAME_SCENE_REQ = GW_RENAME_SCENE_REQ;
//# sourceMappingURL=GW_RENAME_SCENE_REQ.js.map