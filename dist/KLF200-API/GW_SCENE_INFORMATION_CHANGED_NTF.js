'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
var SceneChangeType;
(function (SceneChangeType) {
    SceneChangeType[SceneChangeType["Deleted"] = 0] = "Deleted";
    SceneChangeType[SceneChangeType["Modified"] = 1] = "Modified";
})(SceneChangeType = exports.SceneChangeType || (exports.SceneChangeType = {}));
class GW_SCENE_INFORMATION_CHANGED_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.SceneChangeType = this.Data.readUInt8(0);
        this.SceneID = this.Data.readUInt8(1);
    }
}
exports.GW_SCENE_INFORMATION_CHANGED_NTF = GW_SCENE_INFORMATION_CHANGED_NTF;
