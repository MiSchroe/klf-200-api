'use strict';

import { IFrameRcvFactory, IGW_FRAME_RCV_CTOR, IGW_FRAME_RCV, GatewayCommand } from "./common";

export class FrameRcvFactory implements IFrameRcvFactory {
    private static factory: FrameRcvFactory;

    private factoryRegistry: { [Command: number]: IGW_FRAME_RCV_CTOR };
    private constructor() {
        this.factoryRegistry = {};
    }

    public static getFactory(): FrameRcvFactory {
        if (!FrameRcvFactory.factory)
        {
            FrameRcvFactory.factory = new FrameRcvFactory();
        }
        return FrameRcvFactory.factory;
    }

    public registerClassForCommand(Command: GatewayCommand, FrameType: IGW_FRAME_RCV_CTOR) {
        this.factoryRegistry[Command] = FrameType;
    }

    public CreateRcvFrame(Buff: Buffer): IGW_FRAME_RCV {
        const Command = Buff.readUInt16BE(1);
        const typeToCreate: IGW_FRAME_RCV_CTOR | undefined = this.factoryRegistry[Command];

        if (typeToCreate === undefined)
            throw new Error(`Unknown command ${Command.toString(16)}.`);

        return new typeToCreate(Buff);
    }
}
