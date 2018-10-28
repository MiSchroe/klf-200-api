/// <reference types="node" />
import { IGW_FRAME_RCV } from "./common";
import { Socket } from "net";
import { Listener } from "../utils/TypedEvent";
export declare type FrameReceivedHandler = (frame: IGW_FRAME_RCV) => void;
export declare class KLF200SocketProtocol {
    private state;
    private queue;
    constructor(socket: Socket, handler: Listener<IGW_FRAME_RCV>);
    private processData;
    addHandler(handler: Listener<IGW_FRAME_RCV>): void;
    removeHandler(handler: Listener<IGW_FRAME_RCV>): void;
    send(data: Buffer): Promise<void>;
}
