"use strict";

import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { GatewayCommand, IGW_FRAME_RCV, IGW_FRAME_RCV_CTOR } from "./common";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class FrameRcvFactory {
	public static async CreateRcvFrame(Buff: Buffer): Promise<IGW_FRAME_RCV> {
		const CommandName = GatewayCommand[Buff.readUInt16BE(1)];
		await this.LoadModule(CommandName);
		const typeToCreate: IGW_FRAME_RCV_CTOR | undefined = this.modules[CommandName][CommandName];

		if (typeToCreate === undefined) throw new Error(`Unknown command ${CommandName}.`);

		return new typeToCreate(Buff);
	}

	private static modules: {
		[index: string]: { [key: string]: IGW_FRAME_RCV_CTOR };
	} = {};
	private static async LoadModule(moduleName: string): Promise<void> {
		if (!this.modules[moduleName]) {
			let modulePath = resolve(__dirname, moduleName);
			if (!modulePath.startsWith("file://")) {
				modulePath = `file://${modulePath}`;
			}
			this.modules[moduleName] = await import(modulePath);
		}
	}
}
