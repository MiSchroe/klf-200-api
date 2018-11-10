'use strict';

import { IGW_FRAME_RCV_CTOR, IGW_FRAME_RCV, GatewayCommand } from "./common";
import * as path from "path";

export class FrameRcvFactory {
    public static async CreateRcvFrame(Buff: Buffer): Promise<IGW_FRAME_RCV> {
        const CommandName = GatewayCommand[Buff.readUInt16BE(1)];
        await this.LoadModule(CommandName);
        const typeToCreate: IGW_FRAME_RCV_CTOR | undefined = this.modules[CommandName][CommandName];

        if (typeToCreate === undefined)
            throw new Error(`Unknown command ${CommandName}.`);

        return new typeToCreate(Buff);
    }

    private static modules: {
        [index: string]: { [key: string]: IGW_FRAME_RCV_CTOR }
    } = {};
    private static async LoadModule(moduleName: string): Promise<void> {
        if (!this.modules[moduleName]) {
            const modulePath = path.resolve(__dirname, moduleName);
            this.modules[moduleName] = await import(modulePath);
        }
    }
}
