"use strict";

import { IConnection } from "../src";

export async function waitForNotificationHandler(conn: IConnection): Promise<void> {
	await Promise.race([
		new Promise<void>((resolve) => {
			setTimeout(resolve, 2000);
		}),
		new Promise<void>((resolve) => {
			conn.KLF200SocketProtocol?.once((_event) => {
				resolve();
			});
		}),
	]);
}
