'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    static CreateRcvFrame(Buff) {
        return __awaiter(this, void 0, void 0, function* () {
            const CommandName = common_1.GatewayCommand[Buff.readUInt16BE(1)];
            yield this.LoadModule(CommandName);
            const typeToCreate = this.modules[CommandName][CommandName];
            if (typeToCreate === undefined)
                throw new Error(`Unknown command ${CommandName}.`);
            return new typeToCreate(Buff);
        });
    }
    static LoadModule(moduleName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.modules[moduleName]) {
                const modulePath = path.resolve(__dirname, moduleName);
                this.modules[moduleName] = yield Promise.resolve().then(() => __importStar(require(modulePath)));
            }
        });
    }
}
FrameRcvFactory.modules = {};
exports.FrameRcvFactory = FrameRcvFactory;
//# sourceMappingURL=FrameRcvFactory.js.map