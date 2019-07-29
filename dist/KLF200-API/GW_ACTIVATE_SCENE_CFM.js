'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_SCENES_1 = require("./GW_SCENES");
class GW_ACTIVATE_SCENE_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.Status = this.Data.readUInt8(0);
        this.SessionID = this.Data.readUInt16BE(1);
    }
    getError() {
        switch (this.Status) {
            case GW_SCENES_1.ActivateSceneStatus.OK:
                return "No error.";
            case GW_SCENES_1.ActivateSceneStatus.InvalidParameter:
                return "Invalid parameter.";
            case GW_SCENES_1.ActivateSceneStatus.RequestRejected:
                return "Request rejected.";
            default:
                return `Unknown error ${this.Status}.`;
        }
    }
}
exports.GW_ACTIVATE_SCENE_CFM = GW_ACTIVATE_SCENE_CFM;
//# sourceMappingURL=GW_ACTIVATE_SCENE_CFM.js.map