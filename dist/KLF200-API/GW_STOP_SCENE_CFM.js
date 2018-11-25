'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_SCENES_1 = require("./GW_SCENES");
class GW_STOP_SCENE_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.Status = this.Data.readUInt8(0);
        this.SessionID = this.Data.readUInt16BE(1);
    }
    getError() {
        switch (this.Status) {
            case GW_SCENES_1.ActivateSceneStatus.OK:
                throw new Error("No error.");
            case GW_SCENES_1.ActivateSceneStatus.RequestRejected:
                return "Request failed.";
            case GW_SCENES_1.ActivateSceneStatus.InvalidParameter:
                return "Invalid parameter.";
            default:
                return `Unknown error ${this.Status}.`;
        }
    }
}
exports.GW_STOP_SCENE_CFM = GW_STOP_SCENE_CFM;
