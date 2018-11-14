'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const TypedEvent_1 = require("../utils/TypedEvent");
const FrameRcvFactory_1 = require("./FrameRcvFactory");
const onFrameReceived = new TypedEvent_1.TypedEvent();
const onDataSent = new TypedEvent_1.TypedEvent();
const onDataReceived = new TypedEvent_1.TypedEvent();
var KLF200SocketProtocolState;
(function (KLF200SocketProtocolState) {
    KLF200SocketProtocolState[KLF200SocketProtocolState["Invalid"] = 0] = "Invalid";
    KLF200SocketProtocolState[KLF200SocketProtocolState["StartFound"] = 1] = "StartFound";
})(KLF200SocketProtocolState || (KLF200SocketProtocolState = {}));
class KLF200SocketProtocol {
    constructor(socket) {
        this.socket = socket;
        this.state = KLF200SocketProtocolState.Invalid;
        this.queue = [];
        socket.on("data", (data) => this.processData(data));
        socket.on("close", (had_error) => this.onSocketClose(had_error));
    }
    processData(data) {
        switch (this.state) {
            case KLF200SocketProtocolState.Invalid:
                // Find first END mark
                const positionStart = data.indexOf(common_1.SLIP_END);
                if (positionStart === -1) // No start found -> ignore complete buffer
                    return;
                this.state = KLF200SocketProtocolState.StartFound;
                this.queue.push(data.slice(positionStart, positionStart + 1));
                // Process remaining data
                if (positionStart + 1 < data.byteLength)
                    this.processData(data.slice(positionStart + 1));
                break;
            case KLF200SocketProtocolState.StartFound:
                // Find END mark
                const positionEnd = data.indexOf(common_1.SLIP_END);
                if (positionEnd === -1) { // No end found -> take complete buffer
                    this.queue.push(data);
                    return;
                }
                this.state = KLF200SocketProtocolState.Invalid;
                this.queue.push(data.slice(0, positionEnd + 1));
                const frameBuffer = Buffer.concat(this.queue);
                // Clear queue and process remaining data, if any
                this.queue = [];
                this.send(frameBuffer);
                if (positionEnd + 1 < data.byteLength)
                    this.processData(data.slice(positionEnd + 1));
                break;
            default:
                break;
        }
    }
    onSocketClose(had_error) {
    }
    on(handler) {
        return onFrameReceived.on(handler);
    }
    off(handler) {
        onFrameReceived.off(handler);
    }
    once(handler) {
        onFrameReceived.once(handler);
    }
    onDataSent(handler) {
        return onDataSent.on(handler);
    }
    onDataReceived(handler) {
        return onDataReceived.on(handler);
    }
    offDataSent(handler) {
        onDataSent.off(handler);
    }
    offDataReceived(handler) {
        onDataReceived.off(handler);
    }
    send(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                onDataReceived.emit(data);
                const frameBuffer = common_1.KLF200Protocol.Decode(common_1.SLIPProtocol.Decode(data));
                const frame = yield FrameRcvFactory_1.FrameRcvFactory.CreateRcvFrame(frameBuffer);
                onFrameReceived.emit(frame);
                return Promise.resolve();
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
    write(data) {
        onDataSent.emit(data);
        const slipBuffer = common_1.SLIPProtocol.Encode(common_1.KLF200Protocol.Encode(data));
        return this.socket.write(slipBuffer);
    }
}
exports.KLF200SocketProtocol = KLF200SocketProtocol;
//# sourceMappingURL=KLF200SocketProtocol.js.map