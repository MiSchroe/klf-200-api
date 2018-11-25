'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GET_SCENE_LIST_NTF extends common_1.GW_FRAME_NTF {
    constructor(Data) {
        super(Data);
        this.Scenes = [];
        this.NumberOfScenes = this.Data.readUInt8(0);
        this.NumberOfRemainingScenes = this.Data.readUInt8(this.NumberOfScenes * 65 + 1);
        for (let sceneIndex = 0; sceneIndex < this.NumberOfScenes; sceneIndex++) {
            this.Scenes.push({
                SceneID: this.Data.readUInt8(sceneIndex * 65 + 1),
                Name: common_1.readZString(this.Data.slice(sceneIndex * 65 + 2, sceneIndex * 65 + 66))
            });
        }
    }
}
exports.GW_GET_SCENE_LIST_NTF = GW_GET_SCENE_LIST_NTF;
