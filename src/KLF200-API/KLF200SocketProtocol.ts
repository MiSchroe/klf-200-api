'use strict';

import { IGW_FRAME_RCV, SLIP_END, SLIPProtocol, KLF200Protocol } from "./common";
import { Socket } from "net";
import { TypedEvent, Listener } from "../utils/TypedEvent";
import { FrameRcvFactory } from "./FrameRcvFactory";

export type FrameReceivedHandler = (frame: IGW_FRAME_RCV) => void;

const onFrameReceived = new TypedEvent<IGW_FRAME_RCV>();

enum KLF200SocketProtocolState {
    Invalid,
    StartFound
}

export class KLF200SocketProtocol {
    private state: KLF200SocketProtocolState = KLF200SocketProtocolState.Invalid;
    private queue: Buffer[] = [];

    constructor(socket: Socket, handler: Listener<IGW_FRAME_RCV>) {
        this.addHandler(handler);

        socket.on("data", (data) =>  this.processData(data));
    }

    private processData(data: Buffer): void {
        switch (this.state) {
            case KLF200SocketProtocolState.Invalid:
                // Find first END mark
                const positionStart = data.indexOf(SLIP_END);
                if (positionStart === -1)   // No start found -> ignore complete buffer
                    return;

                this.state = KLF200SocketProtocolState.StartFound;
                this.queue.push(data.slice(positionStart, positionStart + 1));

                // Process remaining data
                if (positionStart + 1 < data.byteLength)
                    this.processData(data.slice(positionStart + 1));

                break;

            case KLF200SocketProtocolState.StartFound:
                // Find END mark
                const positionEnd = data.indexOf(SLIP_END);
                if (positionEnd === -1) {     // No end found -> take complete buffer
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

    addHandler(handler: Listener<IGW_FRAME_RCV>): void {
        onFrameReceived.on(handler);
    }

    removeHandler(handler: Listener<IGW_FRAME_RCV>): void {
        onFrameReceived.off(handler);
    }

    async send(data: Buffer): Promise<void> {
        const frameBuffer = KLF200Protocol.Decode(SLIPProtocol.Decode(data));
        const frame = await FrameRcvFactory.CreateRcvFrame(frameBuffer);
        onFrameReceived.emit(frame);
    }
}