import { IGW_FRAME_RCV } from "./common";
export declare class FrameRcvFactory {
    static CreateRcvFrame(Buff: Buffer): Promise<IGW_FRAME_RCV>;
    private static modules;
    private static LoadModule;
}
