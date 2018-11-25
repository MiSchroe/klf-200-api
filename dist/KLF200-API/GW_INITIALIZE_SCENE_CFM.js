'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const GW_SCENES_1 = require("./GW_SCENES");
class GW_INITIALIZE_SCENE_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.Status = this.Data.readUInt8(0);
    }
    getError() {
        switch (this.Status) {
            case GW_SCENES_1.InitializeSceneConfirmationStatus.OK:
                throw new Error("No error.");
            case GW_SCENES_1.InitializeSceneConfirmationStatus.EmptySystemTable:
                return "Empty system table.";
            case GW_SCENES_1.InitializeSceneConfirmationStatus.OutOfStorage:
                return "Out of storage for scene.";
            default:
                return `Unknown error ${this.Status}.`;
        }
    }
}
exports.GW_INITIALIZE_SCENE_CFM = GW_INITIALIZE_SCENE_CFM;
