"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** passes through events as they happen. You will not get events from before you start listening */
class TypedEvent {
    constructor() {
        this.listeners = [];
        this.listenersOncer = [];
        this.on = (listener) => {
            this.listeners.push(listener);
            return {
                dispose: () => this.off(listener)
            };
        };
        this.once = (listener) => {
            this.listenersOncer.push(listener);
        };
        this.off = (listener) => {
            var callbackIndex = this.listeners.indexOf(listener);
            if (callbackIndex > -1)
                this.listeners.splice(callbackIndex, 1);
        };
        this.emit = (event) => {
            /** Update any general listeners */
            this.listeners.forEach((listener) => listener(event));
            /** Clear the `once` queue */
            this.listenersOncer.forEach((listener) => listener(event));
            this.listenersOncer = [];
        };
        this.pipe = (te) => {
            return this.on((e) => te.emit(e));
        };
    }
}
exports.TypedEvent = TypedEvent;
//# sourceMappingURL=TypedEvent.js.map