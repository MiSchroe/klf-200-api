'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class FrameRcvFactory {
    constructor() {
        this.factoryRegistry = {};
    }
    static getFactory() {
        if (!FrameRcvFactory.factory) {
            FrameRcvFactory.factory = new FrameRcvFactory();
        }
        return FrameRcvFactory.factory;
    }
    registerClassForCommand(Command, FrameType) {
        this.factoryRegistry[Command] = FrameType;
    }
    CreateRcvFrame(Buff) {
        const Command = Buff.readUInt16BE(1);
        const typeToCreate = this.factoryRegistry[Command];
        if (typeToCreate === undefined)
            throw new Error(`Unknown command ${Command.toString(16)}.`);
        return new typeToCreate(Buff);
    }
}
exports.FrameRcvFactory = FrameRcvFactory;
//# sourceMappingURL=FrameRcvFactory.js.map