"use strict";

import debugModule from "debug";
import { timeout as promiseTimeout } from "promise-timeout";
import {
	ConnectionOptions,
	PeerCertificate,
	TLSSocket,
	checkServerIdentity as checkServerIdentityOriginal,
	connect,
} from "tls";
import { GW_ERROR_NTF } from "./KLF200-API/GW_ERROR_NTF.js";
import { GW_GET_STATE_REQ } from "./KLF200-API/GW_GET_STATE_REQ.js";
import { KLF200SocketProtocol } from "./KLF200-API/KLF200SocketProtocol.js";
import {
	GW_COMMON_STATUS,
	GW_FRAME_COMMAND_REQ,
	GatewayCommand,
	IGW_FRAME,
	IGW_FRAME_COMMAND,
	IGW_FRAME_RCV,
	IGW_FRAME_REQ,
	KLF200_PORT,
} from "./KLF200-API/common.js";
import { ca } from "./ca.js";
import { GW_PASSWORD_ENTER_CFM, GW_PASSWORD_ENTER_REQ } from "./index.js";
import { Disposable, Listener, TypedEvent } from "./utils/TypedEvent.js";

const debug = debugModule(`klf-200-api:connection`);

/**
 * Interface for the connection.
 *
 * @export
 * @interface IConnection
 */
export interface IConnection {
	/**
	 * Logs in to the KLF interface by sending the GW_PASSWORD_ENTER_REQ.
	 *
	 * @param {string} password The password needed for login. The factory default password is velux123.
	 * @param {number} [timeout] A timeout in seconds. After the timeout the returned promise will be rejected.
	 * @returns {Promise<void>} Returns a promise that resolves to true on success or rejects with the errors.
	 * @memberof IConnection
	 */
	loginAsync(password: string, timeout?: number): Promise<void>;

	/**
	 * Logs out from the KLF interface and closes the socket.
	 *
	 * @param {number} [timeout] A timeout in seconds. After the timeout the returned promise will be rejected.
	 * @returns {Promise<void>} Returns a promise that resolves to true on successful logout or rejects with the errors.
	 * @memberof IConnection
	 */
	logoutAsync(timeout?: number): Promise<void>;

	/**
	 * Sends a request frame to the KLF interface.
	 *
	 * @param {IGW_FRAME_REQ} frame The frame that should be sent to the KLF interface.
	 * @param {number} [timeout] A timeout in seconds. After the timeout the returned promise will be rejected.
	 * @returns {Promise<IGW_FRAME_RCV>} Returns a promise with the corresponding confirmation message as value.
	 *                                   In case of an error frame the promise will be rejected with the error number.
	 *                                   If the request frame is a command (with a SessionID) than the promise will be
	 *                                   resolved by the corresponding confirmation frame with a matching session ID.
	 * @memberof IConnection
	 */
	sendFrameAsync(frame: IGW_FRAME_REQ, timeout?: number): Promise<IGW_FRAME_RCV>;

	/**
	 * Add a handler to listen for confirmations and notification.
	 * You can provide an optional filter to listen only to
	 * specific events.
	 *
	 * @param {Listener<IGW_FRAME_RCV>} handler Callback functions that is called for an event
	 * @param {GatewayCommand[]} [filter] Array of GatewayCommand entries you want to listen to. Optional.
	 * @returns {Disposable} Returns a Disposable that you can call to remove the handler.
	 * @memberof Connection
	 */
	on(handler: Listener<IGW_FRAME_RCV>, filter?: GatewayCommand[]): Disposable;

	/**
	 * Add a handler to listen for confirmations and notification.
	 * You can provide an optional filter to listen only to
	 * specific events.
	 *
	 * @param {Listener<IGW_FRAME_REQ>} handler Callback functions that is called for an event
	 * @param {GatewayCommand[]} [filter] Array of GatewayCommand entries you want to listen to. Optional.
	 * @returns {Disposable} Returns a Disposable that you can call to remove the handler.
	 * @memberof Connection
	 */
	onFrameSent(handler: Listener<IGW_FRAME_REQ>, filter?: GatewayCommand[]): Disposable;

	/**
	 * Gets the underlying socket protocol handler.
	 *
	 * @type {KLF200SocketProtocol}
	 * @memberof IConnection
	 */
	readonly KLF200SocketProtocol?: KLF200SocketProtocol;
}

const FINGERPRINT: string = "02:8C:23:A0:89:2B:62:98:C4:99:00:5B:D2:E7:2E:0A:70:3D:71:6A";

/**
 * The Connection class is used to handle the communication with the Velux KLF interface.
 * It provides login and logout functionality and provides methods to run other commands
 * on the socket API.
 *
 * ```
 * const Connection = require('velux-api').Connection;
 *
 * let conn = new Connection('velux-klf-12ab');
 * conn.loginAsync('velux123')
 *     .then(() => {
 *         ... do some other stuff ...
 *         return conn.logoutAsync();
 *      })
 *     .catch((err) => {    // always close the connection
 *         return conn.logoutAsync().reject(err);
 *      });
 * ```
 *
 * @export
 * @class Connection
 */
export class Connection implements IConnection {
	private sckt?: TLSSocket;
	private klfProtocol?: KLF200SocketProtocol;

	readonly host: string;
	readonly CA: Buffer = ca;
	readonly fingerprint: string = FINGERPRINT;
	readonly connectionOptions?: ConnectionOptions;

	/**
	 * Creates a new connection object that connect to the given host.
	 * @param {string} host Host name or IP address of the KLF-200 interface.
	 * @param {Buffer} [CA=ca] A buffer with a certificate of the certificate authority.
	 *                         Currently, the interface uses a self-signed certificate
	 *                         thus a certificate has to be provided for the CA.
	 *                         This parameter is optional and in case the certificate
	 *                         will be changed with subsequent firmware updates you can
	 *                         provide the matching certificate with this parameter.
	 * @param {string} [fingerprint=FINGERPRINT] The fingerprint of the certificate. This parameter is optional.
	 * @memberof Connection
	 */
	constructor(host: string, CA?: Buffer, fingerprint?: string);
	/**
	 * Creates a new connection object that connect to the given host.
	 * @param host Host name or IP address of the KLF-200 interface.
	 * @param connectionOptions Options that will be provided to the connect method of the TLS socket.
	 */
	constructor(host: string, connectionOptions: ConnectionOptions);
	constructor(host: string, CAorConnectionOptions?: Buffer | ConnectionOptions, fingerprint?: string) {
		this.host = host;
		if (CAorConnectionOptions !== undefined) {
			if (Buffer.isBuffer(CAorConnectionOptions)) {
				this.CA = CAorConnectionOptions;
			} else {
				this.connectionOptions = CAorConnectionOptions;
			}
		}
		if (fingerprint !== undefined) {
			this.fingerprint = fingerprint;
		}
	}

	/**
	 * Gets the [[KLF200SocketProtocol]] object used by this connection.
	 * This property has a value after calling [[loginAsync]], only.
	 *
	 * @readonly
	 * @memberof Connection
	 */
	public get KLF200SocketProtocol(): KLF200SocketProtocol | undefined {
		return this.klfProtocol;
	}

	/**
	 * This method implements the login process without timeout.
	 * The [[loginAsync]] function wraps this into a timed promise.
	 *
	 * @private
	 * @param {string} password The password needed for login. The factory default password is velux123.
	 * @returns {Promise<void>} Returns a promise that resolves to true on success or rejects with the errors.
	 * @memberof Connection
	 */
	private async _loginAsync(password: string, timeout: number): Promise<void> {
		try {
			await this.initSocketAsync();
			this.klfProtocol = new KLF200SocketProtocol(<TLSSocket>this.sckt);
			const passwordCFM = <GW_PASSWORD_ENTER_CFM>(
				await this.sendFrameAsync(new GW_PASSWORD_ENTER_REQ(password), timeout)
			);
			if (passwordCFM.Status !== GW_COMMON_STATUS.SUCCESS) {
				return Promise.reject(new Error("Login failed."));
			} else {
				return Promise.resolve();
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * Logs in to the KLF interface by sending the GW_PASSWORD_ENTER_REQ.
	 *
	 * @param {string} password The password needed for login. The factory default password is velux123.
	 * @param {number} [timeout=60] A timeout in seconds. After the timeout the returned promise will be rejected.
	 * @returns {Promise<void>} Returns a promise that resolves to true on success or rejects with the errors.
	 * @memberof Connection
	 */
	public async loginAsync(password: string, timeout: number = 60): Promise<void> {
		try {
			await this._loginAsync(password, timeout);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * Logs out from the KLF interface and closes the socket.
	 *
	 * @param {number} [timeout=10] A timeout in seconds. After the timeout the returned promise will be rejected.
	 * @returns {Promise<void>} Returns a promise that resolves to true on successful logout or rejects with the errors.
	 * @memberof Connection
	 */
	public async logoutAsync(timeout: number = 10): Promise<void> {
		try {
			debug("Logging out from the KLF interface and closing the socket...");
			if (this.sckt) {
				if (this.klfProtocol) {
					this.klfProtocol = undefined;
				}
				return promiseTimeout(
					new Promise<void>((resolve, reject) => {
						try {
							// Close socket
							debug("Closing socket...");
							this.sckt?.end("", () => {
								debug("Socket closed.");
								resolve();
							});
						} catch (error) {
							debug("Error while closing socket:", error);
							reject(error);
						}
					}),
					timeout * 1000,
				);
			} else {
				debug("No socket to close.");
				return Promise.resolve();
			}
		} catch (error) {
			debug("Error while logging out:", error);
			return Promise.reject(error);
		}
	}

	/**
	 * Sends a request frame to the KLF interface.
	 *
	 * @param {IGW_FRAME_REQ} frame The frame that should be sent to the KLF interface.
	 * @param {number} [timeout=10] A timeout in seconds. After the timeout the returned promise will be rejected.
	 * @returns {Promise<IGW_FRAME_RCV>} Returns a promise with the corresponding confirmation message as value.
	 *                                   In case of an error frame the promise will be rejected with the error number.
	 *                                   If the request frame is a command (with a SessionID) than the promise will be
	 *                                   resolved by the corresponding confirmation frame with a matching session ID.
	 * @memberof Connection
	 */
	public async sendFrameAsync(frame: IGW_FRAME_REQ, timeout: number = 10): Promise<IGW_FRAME_RCV> {
		try {
			debug(`sendFrameAsync called with frame: ${stringifyFrame(frame)}, timeout: ${timeout}.`);
			const frameName = GatewayCommand[frame.Command];
			const expectedConfirmationFrameName: keyof typeof GatewayCommand = (frameName.slice(0, -3) +
				"CFM") as keyof typeof GatewayCommand;
			const expectedConfirmationFrameCommand = GatewayCommand[expectedConfirmationFrameName];
			const sessionID = frame instanceof GW_FRAME_COMMAND_REQ ? frame.SessionID : undefined;

			debug(
				`Expected confirmation frame is ${expectedConfirmationFrameName} (${expectedConfirmationFrameCommand}). Session ID: ${sessionID}`,
			);

			// Setup the event handlers first to prevent a race condition
			// where we don't see the events.
			let resolve: (value: IGW_FRAME_RCV | PromiseLike<IGW_FRAME_RCV>) => void, reject: (reason?: any) => void;
			const notificationHandler = new Promise<IGW_FRAME_RCV>((res, rej) => {
				resolve = res;
				reject = rej;
			});

			let cfmHandler: Disposable | undefined = undefined;
			let errHandler: Disposable | undefined = undefined;
			try {
				errHandler = (this.klfProtocol as KLF200SocketProtocol).onError((error) => {
					debug(`sendFrameAsync protocol error handler: ${JSON.stringify(error)}.`);
					errHandler?.dispose();
					cfmHandler?.dispose();
					reject(error);
				});
				cfmHandler = (this.klfProtocol as KLF200SocketProtocol).on((notificationFrame) => {
					try {
						debug(`sendFrameAsync frame recieved: ${stringifyFrame(notificationFrame)}.`);
						if (notificationFrame instanceof GW_ERROR_NTF) {
							debug(`sendFrameAsync GW_ERROR_NTF recieved: ${stringifyFrame(notificationFrame)}.`);
							errHandler?.dispose();
							cfmHandler?.dispose();
							reject(new Error(notificationFrame.getError(), { cause: notificationFrame }));
						} else if (
							notificationFrame.Command === expectedConfirmationFrameCommand &&
							(typeof sessionID === "undefined" ||
								sessionID === (notificationFrame as IGW_FRAME_COMMAND).SessionID)
						) {
							debug(`sendFrameAsync expected frame recieved: ${stringifyFrame(notificationFrame)}.`);
							errHandler?.dispose();
							cfmHandler?.dispose();
							resolve(notificationFrame);
						}
					} catch (error) {
						errHandler?.dispose();
						cfmHandler?.dispose();
						reject(error);
					}
				});
				this.shiftKeepAlive();
				await (this.klfProtocol as KLF200SocketProtocol).write(frame.Data);
				await this.notifyFrameSent(frame);

				return await promiseTimeout(notificationHandler, timeout * 1000);
			} catch (error) {
				debug(
					`sendFrameAsync error occurred: ${typeof error === "string" ? error : JSON.stringify(error)} with frame sent: ${stringifyFrame(frame)}.`,
				);
				errHandler?.dispose();
				cfmHandler?.dispose();
				reject!(error);
				return Promise.reject(error);
			}
		} catch (error) {
			debug(
				`sendFrameAsync error occurred (outer): ${typeof error === "string" ? error : JSON.stringify(error)} with frame sent: ${stringifyFrame(frame)}.`,
			);
			return Promise.reject(error);
		}

		function stringifyFrame(frame: IGW_FRAME): string {
			return JSON.stringify(frame, (key: string, value: any) => {
				if (key.match(/password/i)) {
					return "**********";
				} else {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-return
					return value;
				}
			});
		}
	}

	/**
	 * Add a handler to listen for confirmations and notification.
	 * You can provide an optional filter to listen only to
	 * specific events.
	 *
	 * @param {Listener<IGW_FRAME_RCV>} handler Callback functions that is called for an event
	 * @param {GatewayCommand[]} [filter] Array of GatewayCommand entries you want to listen to. Optional.
	 * @returns {Disposable} Returns a Disposable that you can call to remove the handler.
	 * @memberof Connection
	 */
	public on(handler: Listener<IGW_FRAME_RCV>, filter?: GatewayCommand[]): Disposable {
		if (typeof filter === "undefined") {
			return (this.klfProtocol as KLF200SocketProtocol).on(handler);
		} else {
			return (this.klfProtocol as KLF200SocketProtocol).on(async (frame) => {
				if (filter.indexOf(frame.Command) >= 0) {
					await Promise.resolve(handler(frame));
				}
			});
		}
	}

	private _onFrameSent = new TypedEvent<IGW_FRAME_REQ>();
	/**
	 * Add a handler to listen for sent frames.
	 * You can provide an optional filter to listen only to
	 * specific events.
	 *
	 * @param {Listener<IGW_FRAME_REQ>} handler Callback functions that is called for an event
	 * @param {GatewayCommand[]} [filter] Array of GatewayCommand entries you want to listen to. Optional.
	 * @returns {Disposable} Returns a Disposable that you can call to remove the handler.
	 * @memberof Connection
	 */
	public onFrameSent(handler: Listener<IGW_FRAME_REQ>, filter?: GatewayCommand[]): Disposable {
		if (typeof filter === "undefined") {
			return this._onFrameSent.on(handler);
		} else {
			return this._onFrameSent.on((frame) => {
				if (filter.indexOf(frame.Command) >= 0) {
					handler(frame);
				}
			});
		}
	}

	private async notifyFrameSent(frame: IGW_FRAME_REQ): Promise<void> {
		await this._onFrameSent.emit(frame);
	}

	private keepAliveTimer?: NodeJS.Timeout;
	private keepAliveInterval: number = 10 * 60 * 1000;

	/**
	 * Start a keep-alive timer to send a message
	 * at least every [[interval]] minutes to the interface.
	 * The KLF-200 interface will close the connection
	 * after 15 minutes of inactivity.
	 *
	 * @param {number} [interval=600000] Keep-alive interval in minutes. Defaults to 10 min.
	 * @memberof Connection
	 */
	public startKeepAlive(interval: number = 10 * 60 * 1000): void {
		this.keepAliveInterval = interval;
		this.keepAliveTimer = setInterval(() => {
			this.sendKeepAlive().catch((error) =>
				debug(`Error while sending keep alive: ${typeof error === "string" ? error : JSON.stringify(error)}`),
			);
		}, interval);
	}

	/**
	 * Stops the keep-alive timer.
	 * If not timer is set nothing happens.
	 *
	 * @memberof Connection
	 */
	public stopKeepAlive(): void {
		if (this.keepAliveTimer) {
			clearInterval(this.keepAliveTimer);
			this.keepAliveTimer = undefined;
		}
	}

	/**
	 * Sends a keep-alive message to the interface
	 * to keep the socket connection open.
	 *
	 * @private
	 * @returns {Promise<void>} Resolves if successful, otherwise reject
	 * @memberof Connection
	 */
	private async sendKeepAlive(): Promise<void> {
		await this.sendFrameAsync(new GW_GET_STATE_REQ());
		return;
	}

	/**
	 * Shifts the keep-alive timer to restart its counter.
	 * If no keep-alive timer is active nothing happens.
	 *
	 * @private
	 * @memberof Connection
	 */
	private shiftKeepAlive(): void {
		if (this.keepAliveTimer) {
			clearInterval(this.keepAliveTimer);
			this.startKeepAlive(this.keepAliveInterval);
		}
	}

	private async initSocketAsync(): Promise<void> {
		try {
			if (this.sckt === undefined) {
				return new Promise<void>((resolve, reject) => {
					try {
						const loginErrorHandler = (error: unknown): void => {
							console.error(`loginErrorHandler: ${JSON.stringify(error)}`);
							this.sckt = undefined;
							reject(error);
						};

						this.sckt = connect(
							KLF200_PORT,
							this.host,
							this.connectionOptions
								? this.connectionOptions
								: {
										rejectUnauthorized: true,
										ca: [this.CA],
										checkServerIdentity: (host, cert) => this.checkServerIdentity(host, cert),
									},
							() => {
								// Callback on event "secureConnect":
								// Resolve promise if connection is authorized, otherwise reject it.
								if (this.sckt?.authorized) {
									// Remove login error handler
									this.sckt?.off("error", loginErrorHandler);
									resolve();
								} else {
									const err = this.sckt?.authorizationError;
									this.sckt = undefined;
									console.error(`AuthorizationError: ${err!.toString()}`);
									reject(err);
								}
							},
						);

						// Add error handler to reject the promise on login problems
						this.sckt?.on("error", loginErrorHandler);

						this.sckt?.on("close", () => {
							// Socket has been closed -> clean up everything
							this.socketClosedEventHandler();
						});

						// Add additional error handler for the lifetime of the socket
						this.sckt?.on("error", () => {
							// Socket has an error -> clean up everything
							this.socketClosedEventHandler();
						});

						// React to end events:
						this.sckt?.on("end", () => {
							if (this.sckt?.allowHalfOpen) {
								this.sckt?.end(() => {
									this.socketClosedEventHandler();
								});
							}
						});

						// Timeout of socket:
						this.sckt?.on("timeout", () => {
							this.sckt?.end(() => {
								this.socketClosedEventHandler();
							});
						});
					} catch (error) {
						console.error(`initSocketAsync inner catch: ${JSON.stringify(error)}`);
						reject(error);
					}
				});
			} else {
				return Promise.resolve();
			}
		} catch (error) {
			console.error(`initSocketAsync outer catch: ${JSON.stringify(error)}`);
			return Promise.reject(error);
		}
	}

	private socketClosedEventHandler(): void {
		// Socket has been closed -> clean up everything
		this.stopKeepAlive();
		this.klfProtocol = undefined;
		this.sckt = undefined;
	}

	private checkServerIdentity(host: string, cert: PeerCertificate): Error | undefined {
		if (cert.fingerprint === this.fingerprint) return undefined;
		else return checkServerIdentityOriginal(host, cert);
	}
}
