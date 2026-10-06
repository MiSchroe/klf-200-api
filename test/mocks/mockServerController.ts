import { ChildProcess, fork, Serializable } from "child_process";
import { randomUUID } from "crypto";
import debugModule from "debug";
import deepEqual from "deep-eql";
import { dirname, join } from "path";
import { timeout } from "promise-timeout";
import { fileURLToPath } from "url";
import { AcknowledgeMessage, Command, CommandWithGuid, KillCommand } from "./mockServer/commands.js";
import { isMockServerReadyMessage } from "./mockServer/mockServerReadyMessage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const debug = debugModule(`mockServerController:client`);

export class MockServerController {
	serverProcess: ChildProcess;
	port: number = 0;

	private constructor(useExpiredCert: boolean = false) {
		this.serverProcess = fork(join(__dirname, "mockServer/mockServer"), [], {
			env: { ...process.env, USE_EXPIRED_CERT: useExpiredCert.toString() },
		}); //, { stdio: "ignore" });
	}

	static async createMockServer(useExpiredCert: boolean = false): Promise<MockServerController> {
		const mockServer = new MockServerController(useExpiredCert);
		await new Promise<void>((resolve) => {
			const onMessage = function (message: Serializable): void {
				if (isMockServerReadyMessage(message)) {
					debug("Ready message received from child process.");
					mockServer.port = message.port;
					mockServer.serverProcess.off("message", onMessage);
					resolve();
				}
			};
			mockServer.serverProcess.on("message", (message) => {
				onMessage(message);
			});
		});
		return await Promise.resolve(mockServer);
	}

	/**
	 * sendCommand
	 */
	public async sendCommand(command: Command): Promise<void> {
		const commandWithGuid: CommandWithGuid = { ...command, CommandGuid: randomUUID() };
		let cleanup = (): void => {};
		try {
			await timeout(
				new Promise<void>((resolve, reject) => {
					const onMessage = (message: AcknowledgeMessage): void => {
						debug(`In sendCommand onMessage handler. message: ${JSON.stringify(message)}`);
						if (deepEqual(commandWithGuid.CommandGuid, message.originalCommandGuid)) {
							switch (message.messageType) {
								case "ERR":
									reject(new Error(message.errorMessage));
									break;

								case "ACK":
									resolve();
									break;

								default:
									break;
							}
						}
					};
					const onDisconnect = (): void => {
						reject(new Error("Mock server IPC channel disconnected."));
					};
					cleanup = (): void => {
						this.serverProcess.off("message", onMessage);
						this.serverProcess.off("disconnect", onDisconnect);
					};
					this.serverProcess.on("message", onMessage);
					this.serverProcess.once("disconnect", onDisconnect);
					this.serverProcess.send(commandWithGuid, (error) => {
						if (error) {
							reject(error);
						}
					});
				}),
				10000,
			);
		} finally {
			cleanup();
		}
	}

	async [Symbol.asyncDispose](): Promise<void> {
		debug(`In Symbol.asyncDispose, connected: ${this.serverProcess?.connected}.`);
		if (this.serverProcess?.connected) {
			try {
				const waitOnClosePromise = new Promise<void>((resolve) => {
					this.serverProcess.on("close", () => {
						debug("close event on server process");
						resolve();
					});
				});
				debug("Before Kill command");
				await this.sendCommand(KillCommand);
				debug("After Kill command");
				return await waitOnClosePromise;
			} catch (e) {
				debug(`Exception occurred in Symbol.asyncDispose: ${typeof e === "string" ? e : JSON.stringify(e)}`);
			} finally {
				debug("In finally in Symbol.asyncDispose.");
				if (this.serverProcess?.connected) {
					this.serverProcess?.disconnect();
					debug("After disconnect");
				}
				this.serverProcess?.kill();
				debug("After process kill");
				this.serverProcess?.unref();
				debug("After unref()");
			}
		} else {
			return await Promise.resolve();
		}
	}
}
