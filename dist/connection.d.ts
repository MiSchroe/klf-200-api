/// <reference types="node" />
import { IGW_FRAME_RCV, IGW_FRAME_REQ } from "./KLF200-API/common";
export declare class connection {
    readonly host: string;
    readonly CA: Buffer;
    readonly fingerprint: string;
    private sckt?;
    private klfProtocol?;
    constructor(host: string, CA?: Buffer, fingerprint?: string);
    loginAsync(password: string): Promise<void>;
    logoutAsync(): Promise<void>;
    sendFrame(frame: IGW_FRAME_REQ): Promise<IGW_FRAME_RCV>;
    private initSocket;
    private checkServerIdentity;
}
