/// <reference types="node" />
import { IGW_FRAME_RCV } from "./common";
import { Socket } from "net";
import { Listener, Disposable } from "../utils/TypedEvent";
export declare type FrameReceivedHandler = (frame: IGW_FRAME_RCV) => void;
export declare class KLF200SocketProtocol {
    readonly socket: Socket;
    private state;
    private queue;
    constructor(socket: Socket);
    private processData;
    private onSocketClose;
    on(handler: Listener<IGW_FRAME_RCV>): Disposable;
    off(handler: Listener<IGW_FRAME_RCV>): void;
    once(handler: Listener<IGW_FRAME_RCV>): void;
    send(data: Buffer): Promise<void>;
    write(data: Buffer): boolean;
}
