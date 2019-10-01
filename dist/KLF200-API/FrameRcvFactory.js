"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const path = __importStar(require("path"));
class FrameRcvFactory {
    static async CreateRcvFrame(Buff) {
        const CommandName = common_1.GatewayCommand[Buff.readUInt16BE(1)];
        await this.LoadModule(CommandName);
        const typeToCreate = this.modules[CommandName][CommandName];
        if (typeToCreate === undefined)
            throw new Error(`Unknown command ${CommandName}.`);
        return new typeToCreate(Buff);
    }
    static async LoadModule(moduleName) {
        if (!this.modules[moduleName]) {
            const modulePath = path.resolve(__dirname, moduleName);
            this.modules[moduleName] = await Promise.resolve().then(() => __importStar(require(modulePath)));
        }
    }
}
FrameRcvFactory.modules = {};
exports.FrameRcvFactory = FrameRcvFactory;
//# sourceMappingURL=FrameRcvFactory.js.map