'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_RECORD_SCENE_REQ extends common_1.GW_FRAME_REQ {
    constructor(Name) {
        super(64);
        this.Name = Name;
        if (Buffer.from(Name).byteLength > 64)
            throw "Name too long.";
        const buff = this.Data.slice(this.offset);
        buff.write(this.Name, 0);
    }
}
exports.GW_RECORD_SCENE_REQ = GW_RECORD_SCENE_REQ;
//# sourceMappingURL=GW_RECORD_SCENE_REQ.js.map