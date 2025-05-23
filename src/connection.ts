﻿"use strict";

import debugModule from "debug";
import "disposablestack/auto";
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
	IGW_FRAME_COMMAND,
	IGW_FRAME_RCV,
	IGW_FRAME_REQ,
	KLF200_PORT,
} from "./KLF200-API/common.js";
import { ca } from "./ca.js";
import {
	GW_ACTIVATE_PRODUCTGROUP_CFM,
	GW_ACTIVATE_PRODUCTGROUP_REQ,
	GW_ACTIVATE_SCENE_CFM,
	GW_ACTIVATE_SCENE_REQ,
	GW_CLEAR_ACTIVATION_LOG_CFM,
	GW_CLEAR_ACTIVATION_LOG_REQ,
	GW_COMMAND_SEND_CFM,
	GW_COMMAND_SEND_REQ,
	GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM,
	GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ,
	GW_CS_CONTROLLER_COPY_CFM,
	GW_CS_CONTROLLER_COPY_REQ,
	GW_CS_DISCOVER_NODES_CFM,
	GW_CS_DISCOVER_NODES_REQ,
	GW_CS_GENERATE_NEW_KEY_CFM,
	GW_CS_GENERATE_NEW_KEY_REQ,
	GW_CS_GET_SYSTEMTABLE_DATA_CFM,
	GW_CS_GET_SYSTEMTABLE_DATA_REQ,
	GW_CS_RECEIVE_KEY_CFM,
	GW_CS_RECEIVE_KEY_REQ,
	GW_CS_REMOVE_NODES_CFM,
	GW_CS_REMOVE_NODES_REQ,
	GW_CS_REPAIR_KEY_CFM,
	GW_CS_REPAIR_KEY_REQ,
	GW_CS_VIRGIN_STATE_CFM,
	GW_CS_VIRGIN_STATE_REQ,
	GW_DELETE_GROUP_CFM,
	GW_DELETE_GROUP_REQ,
	GW_DELETE_SCENE_CFM,
	GW_DELETE_SCENE_REQ,
	GW_GET_ACTIVATION_LOG_HEADER_CFM,
	GW_GET_ACTIVATION_LOG_HEADER_REQ,
	GW_GET_ACTIVATION_LOG_LINE_CFM,
	GW_GET_ACTIVATION_LOG_LINE_REQ,
	GW_GET_ALL_GROUPS_INFORMATION_CFM,
	GW_GET_ALL_GROUPS_INFORMATION_REQ,
	GW_GET_ALL_NODES_INFORMATION_CFM,
	GW_GET_ALL_NODES_INFORMATION_REQ,
	GW_GET_CONTACT_INPUT_LINK_LIST_CFM,
	GW_GET_CONTACT_INPUT_LINK_LIST_REQ,
	GW_GET_GROUP_INFORMATION_CFM,
	GW_GET_GROUP_INFORMATION_REQ,
	GW_GET_LIMITATION_STATUS_CFM,
	GW_GET_LIMITATION_STATUS_REQ,
	GW_GET_LOCAL_TIME_CFM,
	GW_GET_LOCAL_TIME_REQ,
	GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_CFM,
	GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ,
	GW_GET_NETWORK_SETUP_CFM,
	GW_GET_NETWORK_SETUP_REQ,
	GW_GET_NODE_INFORMATION_CFM,
	GW_GET_NODE_INFORMATION_REQ,
	GW_GET_PROTOCOL_VERSION_CFM,
	GW_GET_PROTOCOL_VERSION_REQ,
	GW_GET_SCENE_INFORMATION_CFM,
	GW_GET_SCENE_INFORMATION_REQ,
	GW_GET_SCENE_LIST_CFM,
	GW_GET_SCENE_LIST_REQ,
	GW_GET_STATE_CFM,
	GW_GET_VERSION_CFM,
	GW_GET_VERSION_REQ,
	GW_HOUSE_STATUS_MONITOR_DISABLE_CFM,
	GW_HOUSE_STATUS_MONITOR_DISABLE_REQ,
	GW_HOUSE_STATUS_MONITOR_ENABLE_CFM,
	GW_HOUSE_STATUS_MONITOR_ENABLE_REQ,
	GW_INITIALIZE_SCENE_CANCEL_CFM,
	GW_INITIALIZE_SCENE_CANCEL_REQ,
	GW_INITIALIZE_SCENE_CFM,
	GW_INITIALIZE_SCENE_REQ,
	GW_LEAVE_LEARN_STATE_CFM,
	GW_LEAVE_LEARN_STATE_REQ,
	GW_MODE_SEND_CFM,
	GW_MODE_SEND_REQ,
	GW_NEW_GROUP_CFM,
	GW_NEW_GROUP_REQ,
	GW_PASSWORD_CHANGE_CFM,
	GW_PASSWORD_CHANGE_REQ,
	GW_PASSWORD_ENTER_CFM,
	GW_PASSWORD_ENTER_REQ,
	GW_REBOOT_CFM,
	GW_REBOOT_REQ,
	GW_RECORD_SCENE_CFM,
	GW_RECORD_SCENE_REQ,
	GW_REMOVE_CONTACT_INPUT_LINK_CFM,
	GW_REMOVE_CONTACT_INPUT_LINK_REQ,
	GW_RENAME_SCENE_CFM,
	GW_RENAME_SCENE_REQ,
	GW_RTC_SET_TIME_ZONE_CFM,
	GW_RTC_SET_TIME_ZONE_REQ,
	GW_SET_CONTACT_INPUT_LINK_CFM,
	GW_SET_CONTACT_INPUT_LINK_REQ,
	GW_SET_FACTORY_DEFAULT_CFM,
	GW_SET_FACTORY_DEFAULT_REQ,
	GW_SET_GROUP_INFORMATION_CFM,
	GW_SET_GROUP_INFORMATION_REQ,
	GW_SET_LIMITATION_CFM,
	GW_SET_LIMITATION_REQ,
	GW_SET_NETWORK_SETUP_CFM,
	GW_SET_NETWORK_SETUP_REQ,
	GW_SET_NODE_NAME_CFM,
	GW_SET_NODE_NAME_REQ,
	GW_SET_NODE_ORDER_AND_PLACEMENT_CFM,
	GW_SET_NODE_ORDER_AND_PLACEMENT_REQ,
	GW_SET_NODE_VARIATION_CFM,
	GW_SET_NODE_VARIATION_REQ,
	GW_SET_UTC_CFM,
	GW_SET_UTC_REQ,
	GW_STATUS_REQUEST_CFM,
	GW_STATUS_REQUEST_REQ,
	GW_STOP_SCENE_CFM,
	GW_STOP_SCENE_REQ,
	GW_WINK_SEND_CFM,
	GW_WINK_SEND_REQ,
} from "./index.js";
import { Listener, TypedEvent } from "./utils/TypedEvent.js";
import { stringifyFrame } from "./utils/UtilityFunctions.js";

const debug = debugModule(`klf-200-api:connection`);

/**
 * Interface for the connection.
 *
 * @interface IConnection
 */
export interface IConnection {
	/**
	 * Logs in to the KLF interface by sending the GW_PASSWORD_ENTER_REQ.
	 *
	 * @param {string} password The password needed for login. The factory default password is velux123.
	 * @param {number} [timeout] A timeout in seconds. After the timeout the returned promise will be rejected.
	 * @returns {Promise<void>} Returns a promise that resolves to true on success or rejects with the errors.
	 */
	loginAsync(password: string, timeout?: number): Promise<void>;

	/**
	 * Logs out from the KLF interface and closes the socket.
	 *
	 * @param {number} [timeout] A timeout in seconds. After the timeout the returned promise will be rejected.
	 * @returns {Promise<void>} Returns a promise that resolves to true on successful logout or rejects with the errors.
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
	 */
	sendFrameAsync(frame: GW_REBOOT_REQ, timeout?: number): Promise<GW_REBOOT_CFM>;
	sendFrameAsync(frame: GW_SET_FACTORY_DEFAULT_REQ, timeout?: number): Promise<GW_SET_FACTORY_DEFAULT_CFM>;
	sendFrameAsync(frame: GW_GET_VERSION_REQ, timeout?: number): Promise<GW_GET_VERSION_CFM>;
	sendFrameAsync(frame: GW_GET_PROTOCOL_VERSION_REQ, timeout?: number): Promise<GW_GET_PROTOCOL_VERSION_CFM>;
	sendFrameAsync(frame: GW_GET_STATE_REQ, timeout?: number): Promise<GW_GET_STATE_CFM>;
	sendFrameAsync(frame: GW_LEAVE_LEARN_STATE_REQ, timeout?: number): Promise<GW_LEAVE_LEARN_STATE_CFM>;
	sendFrameAsync(frame: GW_GET_NETWORK_SETUP_REQ, timeout?: number): Promise<GW_GET_NETWORK_SETUP_CFM>;
	sendFrameAsync(frame: GW_SET_NETWORK_SETUP_REQ, timeout?: number): Promise<GW_SET_NETWORK_SETUP_CFM>;
	sendFrameAsync(frame: GW_CS_GET_SYSTEMTABLE_DATA_REQ, timeout?: number): Promise<GW_CS_GET_SYSTEMTABLE_DATA_CFM>;
	sendFrameAsync(frame: GW_CS_DISCOVER_NODES_REQ, timeout?: number): Promise<GW_CS_DISCOVER_NODES_CFM>;
	sendFrameAsync(frame: GW_CS_REMOVE_NODES_REQ, timeout?: number): Promise<GW_CS_REMOVE_NODES_CFM>;
	sendFrameAsync(frame: GW_CS_VIRGIN_STATE_REQ, timeout?: number): Promise<GW_CS_VIRGIN_STATE_CFM>;
	sendFrameAsync(frame: GW_CS_CONTROLLER_COPY_REQ, timeout?: number): Promise<GW_CS_CONTROLLER_COPY_CFM>;
	sendFrameAsync(frame: GW_CS_RECEIVE_KEY_REQ, timeout?: number): Promise<GW_CS_RECEIVE_KEY_CFM>;
	sendFrameAsync(frame: GW_CS_GENERATE_NEW_KEY_REQ, timeout?: number): Promise<GW_CS_GENERATE_NEW_KEY_CFM>;
	sendFrameAsync(frame: GW_CS_REPAIR_KEY_REQ, timeout?: number): Promise<GW_CS_REPAIR_KEY_CFM>;
	sendFrameAsync(
		frame: GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ,
		timeout?: number,
	): Promise<GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM>;
	sendFrameAsync(frame: GW_GET_NODE_INFORMATION_REQ, timeout?: number): Promise<GW_GET_NODE_INFORMATION_CFM>;
	sendFrameAsync(
		frame: GW_GET_ALL_NODES_INFORMATION_REQ,
		timeout?: number,
	): Promise<GW_GET_ALL_NODES_INFORMATION_CFM>;
	sendFrameAsync(frame: GW_SET_NODE_VARIATION_REQ, timeout?: number): Promise<GW_SET_NODE_VARIATION_CFM>;
	sendFrameAsync(frame: GW_SET_NODE_NAME_REQ, timeout?: number): Promise<GW_SET_NODE_NAME_CFM>;
	sendFrameAsync(
		frame: GW_SET_NODE_ORDER_AND_PLACEMENT_REQ,
		timeout?: number,
	): Promise<GW_SET_NODE_ORDER_AND_PLACEMENT_CFM>;
	sendFrameAsync(frame: GW_GET_GROUP_INFORMATION_REQ, timeout?: number): Promise<GW_GET_GROUP_INFORMATION_CFM>;
	sendFrameAsync(frame: GW_SET_GROUP_INFORMATION_REQ, timeout?: number): Promise<GW_SET_GROUP_INFORMATION_CFM>;
	sendFrameAsync(frame: GW_DELETE_GROUP_REQ, timeout?: number): Promise<GW_DELETE_GROUP_CFM>;
	sendFrameAsync(frame: GW_NEW_GROUP_REQ, timeout?: number): Promise<GW_NEW_GROUP_CFM>;
	sendFrameAsync(
		frame: GW_GET_ALL_GROUPS_INFORMATION_REQ,
		timeout?: number,
	): Promise<GW_GET_ALL_GROUPS_INFORMATION_CFM>;
	sendFrameAsync(
		frame: GW_HOUSE_STATUS_MONITOR_ENABLE_REQ,
		timeout?: number,
	): Promise<GW_HOUSE_STATUS_MONITOR_ENABLE_CFM>;
	sendFrameAsync(
		frame: GW_HOUSE_STATUS_MONITOR_DISABLE_REQ,
		timeout?: number,
	): Promise<GW_HOUSE_STATUS_MONITOR_DISABLE_CFM>;
	sendFrameAsync(frame: GW_COMMAND_SEND_REQ, timeout?: number): Promise<GW_COMMAND_SEND_CFM>;
	sendFrameAsync(frame: GW_STATUS_REQUEST_REQ, timeout?: number): Promise<GW_STATUS_REQUEST_CFM>;
	sendFrameAsync(frame: GW_WINK_SEND_REQ, timeout?: number): Promise<GW_WINK_SEND_CFM>;
	sendFrameAsync(frame: GW_SET_LIMITATION_REQ, timeout?: number): Promise<GW_SET_LIMITATION_CFM>;
	sendFrameAsync(frame: GW_GET_LIMITATION_STATUS_REQ, timeout?: number): Promise<GW_GET_LIMITATION_STATUS_CFM>;
	sendFrameAsync(frame: GW_MODE_SEND_REQ, timeout?: number): Promise<GW_MODE_SEND_CFM>;
	sendFrameAsync(frame: GW_INITIALIZE_SCENE_REQ, timeout?: number): Promise<GW_INITIALIZE_SCENE_CFM>;
	sendFrameAsync(frame: GW_INITIALIZE_SCENE_CANCEL_REQ, timeout?: number): Promise<GW_INITIALIZE_SCENE_CANCEL_CFM>;
	sendFrameAsync(frame: GW_RECORD_SCENE_REQ, timeout?: number): Promise<GW_RECORD_SCENE_CFM>;
	sendFrameAsync(frame: GW_DELETE_SCENE_REQ, timeout?: number): Promise<GW_DELETE_SCENE_CFM>;
	sendFrameAsync(frame: GW_RENAME_SCENE_REQ, timeout?: number): Promise<GW_RENAME_SCENE_CFM>;
	sendFrameAsync(frame: GW_GET_SCENE_LIST_REQ, timeout?: number): Promise<GW_GET_SCENE_LIST_CFM>;
	sendFrameAsync(frame: GW_GET_SCENE_INFORMATION_REQ, timeout?: number): Promise<GW_GET_SCENE_INFORMATION_CFM>;
	sendFrameAsync(frame: GW_ACTIVATE_SCENE_REQ, timeout?: number): Promise<GW_ACTIVATE_SCENE_CFM>;
	sendFrameAsync(frame: GW_STOP_SCENE_REQ, timeout?: number): Promise<GW_STOP_SCENE_CFM>;
	sendFrameAsync(frame: GW_ACTIVATE_PRODUCTGROUP_REQ, timeout?: number): Promise<GW_ACTIVATE_PRODUCTGROUP_CFM>;
	sendFrameAsync(
		frame: GW_GET_CONTACT_INPUT_LINK_LIST_REQ,
		timeout?: number,
	): Promise<GW_GET_CONTACT_INPUT_LINK_LIST_CFM>;
	sendFrameAsync(frame: GW_SET_CONTACT_INPUT_LINK_REQ, timeout?: number): Promise<GW_SET_CONTACT_INPUT_LINK_CFM>;
	sendFrameAsync(
		frame: GW_REMOVE_CONTACT_INPUT_LINK_REQ,
		timeout?: number,
	): Promise<GW_REMOVE_CONTACT_INPUT_LINK_CFM>;
	sendFrameAsync(
		frame: GW_GET_ACTIVATION_LOG_HEADER_REQ,
		timeout?: number,
	): Promise<GW_GET_ACTIVATION_LOG_HEADER_CFM>;
	sendFrameAsync(frame: GW_CLEAR_ACTIVATION_LOG_REQ, timeout?: number): Promise<GW_CLEAR_ACTIVATION_LOG_CFM>;
	sendFrameAsync(frame: GW_GET_ACTIVATION_LOG_LINE_REQ, timeout?: number): Promise<GW_GET_ACTIVATION_LOG_LINE_CFM>;
	sendFrameAsync(
		frame: GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ,
		timeout?: number,
	): Promise<GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_CFM>;
	sendFrameAsync(frame: GW_SET_UTC_REQ, timeout?: number): Promise<GW_SET_UTC_CFM>;
	sendFrameAsync(frame: GW_RTC_SET_TIME_ZONE_REQ, timeout?: number): Promise<GW_RTC_SET_TIME_ZONE_CFM>;
	sendFrameAsync(frame: GW_GET_LOCAL_TIME_REQ, timeout?: number): Promise<GW_GET_LOCAL_TIME_CFM>;
	sendFrameAsync(frame: GW_PASSWORD_ENTER_REQ, timeout?: number): Promise<GW_PASSWORD_ENTER_CFM>;
	sendFrameAsync(frame: GW_PASSWORD_CHANGE_REQ, timeout?: number): Promise<GW_PASSWORD_CHANGE_CFM>;
	sendFrameAsync(frame: IGW_FRAME_REQ, timeout?: number): Promise<IGW_FRAME_RCV>;

	/**
	 * Add a handler to listen for confirmations and notification.
	 * You can provide an optional filter to listen only to
	 * specific events.
	 *
	 * @param {Listener<IGW_FRAME_RCV>} handler Callback functions that is called for an event
	 * @param {GatewayCommand[]} [filter] Array of GatewayCommand entries you want to listen to. Optional.
	 * @returns {Disposable} Returns a Disposable that you can call to remove the handler.
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
	 */
	onFrameSent(handler: Listener<IGW_FRAME_REQ>, filter?: GatewayCommand[]): Disposable;

	/**
	 * Gets the underlying socket protocol handler.
	 *
	 * @type {KLF200SocketProtocol}
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
 * @class Connection
 */
export class Connection implements IConnection, AsyncDisposable {
	private _disposableStack = new AsyncDisposableStack();

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
	 */
	constructor(host: string, CA?: Buffer, fingerprint?: string);
	/**
	 * Creates a new connection object that connect to the given host.
	 * @param host Host name or IP address of the KLF-200 interface.
	 * @param connectionOptions Options that will be provided to the connect method of the TLS socket.
	 */
	constructor(host: string, connectionOptions: ConnectionOptions);
	constructor(host: string, CAorConnectionOptions?: Buffer | ConnectionOptions, fingerprint?: string) {
		debug(`Creating Connection instance for host: ${host}`);
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

	public async [Symbol.asyncDispose](): Promise<void> {
		debug(`Disposing Connection instance for host: ${this.host}`);
		this.stopKeepAlive();
		await this._disposableStack.disposeAsync();
		if (this.sckt) {
			this.sckt.destroy();
		}
		this.sckt = undefined;
		this.klfProtocol = undefined;
		debug(`Disposed Connection instance for host: ${this.host}`);
	}

	/**
	 * Gets the [[KLF200SocketProtocol]] object used by this connection.
	 * This property has a value after calling [[loginAsync]], only.
	 *
	 * @readonly
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
	 */
	private async _loginAsync(password: string, timeout: number): Promise<void> {
		debug(`Logging in to host (_loginAsync): ${this.host}`);
		using stack = new DisposableStack();
		await this.initSocketAsync();
		this.klfProtocol = new KLF200SocketProtocol(<TLSSocket>this.sckt);
		stack.defer(() => {
			this.klfProtocol = undefined;
		});
		const passwordCFM = await this.sendFrameAsync(new GW_PASSWORD_ENTER_REQ(password), timeout);
		if (passwordCFM.Status !== GW_COMMON_STATUS.SUCCESS) {
			debug("Login failed.");
			return Promise.reject(new Error("Login failed."));
		} else {
			debug("Login successful.");
			this._disposableStack.use(stack.move());
			return Promise.resolve();
		}
	}

	/**
	 * Logs in to the KLF interface by sending the GW_PASSWORD_ENTER_REQ.
	 *
	 * @param {string} password The password needed for login. The factory default password is velux123.
	 * @param {number} [timeout=60] A timeout in seconds. After the timeout the returned promise will be rejected.
	 * @returns {Promise<void>} Returns a promise that resolves to true on success or rejects with the errors.
	 */
	public async loginAsync(password: string, timeout: number = 60): Promise<void> {
		debug(`Logging in to host: ${this.host}`);
		await this._loginAsync(password, timeout);
	}

	/**
	 * Logs out from the KLF interface and closes the socket.
	 *
	 * @param {number} [timeout=10] A timeout in seconds. After the timeout the returned promise will be rejected.
	 * @returns {Promise<void>} Returns a promise that resolves to true on successful logout or rejects with the errors.
	 */
	public async logoutAsync(timeout: number = 10): Promise<void> {
		debug(`Logging out from host: ${this.host}`);
		try {
			debug("Logging out from the KLF interface and closing the socket...");
			if (this.sckt) {
				if (this.klfProtocol) {
					this.klfProtocol = undefined;
				}
				await promiseTimeout(
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
							reject(error as Error);
						}
					}),
					timeout * 1000,
				);
				await this._disposableStack.disposeAsync();
				this._disposableStack = new AsyncDisposableStack();
			} else {
				debug("No socket to close.");
				return Promise.resolve();
			}
		} catch (error) {
			debug("Error while logging out:", error);
			return Promise.reject(error as Error);
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
	 */
	public async sendFrameAsync(frame: GW_REBOOT_REQ, timeout?: number): Promise<GW_REBOOT_CFM>;
	public async sendFrameAsync(
		frame: GW_SET_FACTORY_DEFAULT_REQ,
		timeout?: number,
	): Promise<GW_SET_FACTORY_DEFAULT_CFM>;
	public async sendFrameAsync(frame: GW_GET_VERSION_REQ, timeout?: number): Promise<GW_GET_VERSION_CFM>;
	public async sendFrameAsync(
		frame: GW_GET_PROTOCOL_VERSION_REQ,
		timeout?: number,
	): Promise<GW_GET_PROTOCOL_VERSION_CFM>;
	public async sendFrameAsync(frame: GW_GET_STATE_REQ, timeout?: number): Promise<GW_GET_STATE_CFM>;
	public async sendFrameAsync(frame: GW_LEAVE_LEARN_STATE_REQ, timeout?: number): Promise<GW_LEAVE_LEARN_STATE_CFM>;
	public async sendFrameAsync(frame: GW_GET_NETWORK_SETUP_REQ, timeout?: number): Promise<GW_GET_NETWORK_SETUP_CFM>;
	public async sendFrameAsync(frame: GW_SET_NETWORK_SETUP_REQ, timeout?: number): Promise<GW_SET_NETWORK_SETUP_CFM>;
	public async sendFrameAsync(
		frame: GW_CS_GET_SYSTEMTABLE_DATA_REQ,
		timeout?: number,
	): Promise<GW_CS_GET_SYSTEMTABLE_DATA_CFM>;
	public async sendFrameAsync(frame: GW_CS_DISCOVER_NODES_REQ, timeout?: number): Promise<GW_CS_DISCOVER_NODES_CFM>;
	public async sendFrameAsync(frame: GW_CS_REMOVE_NODES_REQ, timeout?: number): Promise<GW_CS_REMOVE_NODES_CFM>;
	public async sendFrameAsync(frame: GW_CS_VIRGIN_STATE_REQ, timeout?: number): Promise<GW_CS_VIRGIN_STATE_CFM>;
	public async sendFrameAsync(frame: GW_CS_CONTROLLER_COPY_REQ, timeout?: number): Promise<GW_CS_CONTROLLER_COPY_CFM>;
	public async sendFrameAsync(frame: GW_CS_RECEIVE_KEY_REQ, timeout?: number): Promise<GW_CS_RECEIVE_KEY_CFM>;
	public async sendFrameAsync(
		frame: GW_CS_GENERATE_NEW_KEY_REQ,
		timeout?: number,
	): Promise<GW_CS_GENERATE_NEW_KEY_CFM>;
	public async sendFrameAsync(frame: GW_CS_REPAIR_KEY_REQ, timeout?: number): Promise<GW_CS_REPAIR_KEY_CFM>;
	public async sendFrameAsync(
		frame: GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ,
		timeout?: number,
	): Promise<GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM>;
	public async sendFrameAsync(
		frame: GW_GET_NODE_INFORMATION_REQ,
		timeout?: number,
	): Promise<GW_GET_NODE_INFORMATION_CFM>;
	public async sendFrameAsync(
		frame: GW_GET_ALL_NODES_INFORMATION_REQ,
		timeout?: number,
	): Promise<GW_GET_ALL_NODES_INFORMATION_CFM>;
	public async sendFrameAsync(frame: GW_SET_NODE_VARIATION_REQ, timeout?: number): Promise<GW_SET_NODE_VARIATION_CFM>;
	public async sendFrameAsync(frame: GW_SET_NODE_NAME_REQ, timeout?: number): Promise<GW_SET_NODE_NAME_CFM>;
	public async sendFrameAsync(
		frame: GW_SET_NODE_ORDER_AND_PLACEMENT_REQ,
		timeout?: number,
	): Promise<GW_SET_NODE_ORDER_AND_PLACEMENT_CFM>;
	public async sendFrameAsync(
		frame: GW_GET_GROUP_INFORMATION_REQ,
		timeout?: number,
	): Promise<GW_GET_GROUP_INFORMATION_CFM>;
	public async sendFrameAsync(
		frame: GW_SET_GROUP_INFORMATION_REQ,
		timeout?: number,
	): Promise<GW_SET_GROUP_INFORMATION_CFM>;
	public async sendFrameAsync(frame: GW_DELETE_GROUP_REQ, timeout?: number): Promise<GW_DELETE_GROUP_CFM>;
	public async sendFrameAsync(frame: GW_NEW_GROUP_REQ, timeout?: number): Promise<GW_NEW_GROUP_CFM>;
	public async sendFrameAsync(
		frame: GW_GET_ALL_GROUPS_INFORMATION_REQ,
		timeout?: number,
	): Promise<GW_GET_ALL_GROUPS_INFORMATION_CFM>;
	public async sendFrameAsync(
		frame: GW_HOUSE_STATUS_MONITOR_ENABLE_REQ,
		timeout?: number,
	): Promise<GW_HOUSE_STATUS_MONITOR_ENABLE_CFM>;
	public async sendFrameAsync(
		frame: GW_HOUSE_STATUS_MONITOR_DISABLE_REQ,
		timeout?: number,
	): Promise<GW_HOUSE_STATUS_MONITOR_DISABLE_CFM>;
	public async sendFrameAsync(frame: GW_COMMAND_SEND_REQ, timeout?: number): Promise<GW_COMMAND_SEND_CFM>;
	public async sendFrameAsync(frame: GW_STATUS_REQUEST_REQ, timeout?: number): Promise<GW_STATUS_REQUEST_CFM>;
	public async sendFrameAsync(frame: GW_WINK_SEND_REQ, timeout?: number): Promise<GW_WINK_SEND_CFM>;
	public async sendFrameAsync(frame: GW_SET_LIMITATION_REQ, timeout?: number): Promise<GW_SET_LIMITATION_CFM>;
	public async sendFrameAsync(
		frame: GW_GET_LIMITATION_STATUS_REQ,
		timeout?: number,
	): Promise<GW_GET_LIMITATION_STATUS_CFM>;
	public async sendFrameAsync(frame: GW_MODE_SEND_REQ, timeout?: number): Promise<GW_MODE_SEND_CFM>;
	public async sendFrameAsync(frame: GW_INITIALIZE_SCENE_REQ, timeout?: number): Promise<GW_INITIALIZE_SCENE_CFM>;
	public async sendFrameAsync(
		frame: GW_INITIALIZE_SCENE_CANCEL_REQ,
		timeout?: number,
	): Promise<GW_INITIALIZE_SCENE_CANCEL_CFM>;
	public async sendFrameAsync(frame: GW_RECORD_SCENE_REQ, timeout?: number): Promise<GW_RECORD_SCENE_CFM>;
	public async sendFrameAsync(frame: GW_DELETE_SCENE_REQ, timeout?: number): Promise<GW_DELETE_SCENE_CFM>;
	public async sendFrameAsync(frame: GW_RENAME_SCENE_REQ, timeout?: number): Promise<GW_RENAME_SCENE_CFM>;
	public async sendFrameAsync(frame: GW_GET_SCENE_LIST_REQ, timeout?: number): Promise<GW_GET_SCENE_LIST_CFM>;
	public async sendFrameAsync(
		frame: GW_GET_SCENE_INFORMATION_REQ,
		timeout?: number,
	): Promise<GW_GET_SCENE_INFORMATION_CFM>;
	public async sendFrameAsync(frame: GW_ACTIVATE_SCENE_REQ, timeout?: number): Promise<GW_ACTIVATE_SCENE_CFM>;
	public async sendFrameAsync(frame: GW_STOP_SCENE_REQ, timeout?: number): Promise<GW_STOP_SCENE_CFM>;
	public async sendFrameAsync(
		frame: GW_ACTIVATE_PRODUCTGROUP_REQ,
		timeout?: number,
	): Promise<GW_ACTIVATE_PRODUCTGROUP_CFM>;
	public async sendFrameAsync(
		frame: GW_GET_CONTACT_INPUT_LINK_LIST_REQ,
		timeout?: number,
	): Promise<GW_GET_CONTACT_INPUT_LINK_LIST_CFM>;
	public async sendFrameAsync(
		frame: GW_SET_CONTACT_INPUT_LINK_REQ,
		timeout?: number,
	): Promise<GW_SET_CONTACT_INPUT_LINK_CFM>;
	public async sendFrameAsync(
		frame: GW_REMOVE_CONTACT_INPUT_LINK_REQ,
		timeout?: number,
	): Promise<GW_REMOVE_CONTACT_INPUT_LINK_CFM>;
	public async sendFrameAsync(
		frame: GW_GET_ACTIVATION_LOG_HEADER_REQ,
		timeout?: number,
	): Promise<GW_GET_ACTIVATION_LOG_HEADER_CFM>;
	public async sendFrameAsync(
		frame: GW_CLEAR_ACTIVATION_LOG_REQ,
		timeout?: number,
	): Promise<GW_CLEAR_ACTIVATION_LOG_CFM>;
	public async sendFrameAsync(
		frame: GW_GET_ACTIVATION_LOG_LINE_REQ,
		timeout?: number,
	): Promise<GW_GET_ACTIVATION_LOG_LINE_CFM>;
	public async sendFrameAsync(
		frame: GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ,
		timeout?: number,
	): Promise<GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_CFM>;
	public async sendFrameAsync(frame: GW_SET_UTC_REQ, timeout?: number): Promise<GW_SET_UTC_CFM>;
	public async sendFrameAsync(frame: GW_RTC_SET_TIME_ZONE_REQ, timeout?: number): Promise<GW_RTC_SET_TIME_ZONE_CFM>;
	public async sendFrameAsync(frame: GW_GET_LOCAL_TIME_REQ, timeout?: number): Promise<GW_GET_LOCAL_TIME_CFM>;
	public async sendFrameAsync(frame: GW_PASSWORD_ENTER_REQ, timeout?: number): Promise<GW_PASSWORD_ENTER_CFM>;
	public async sendFrameAsync(frame: GW_PASSWORD_CHANGE_REQ, timeout?: number): Promise<GW_PASSWORD_CHANGE_CFM>;
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

			try {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				using errHandler = (this.klfProtocol as KLF200SocketProtocol).onError((error) => {
					debug(`sendFrameAsync protocol error handler: ${JSON.stringify(error)}.`);
					reject(error);
				});
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				using cfmHandler = (this.klfProtocol as KLF200SocketProtocol).on((notificationFrame) => {
					try {
						debug(`sendFrameAsync frame received: ${stringifyFrame(notificationFrame)}.`);
						if (notificationFrame instanceof GW_ERROR_NTF) {
							debug(`sendFrameAsync GW_ERROR_NTF received: ${stringifyFrame(notificationFrame)}.`);
							reject(new Error(notificationFrame.getError(), { cause: notificationFrame }));
						} else if (
							notificationFrame.Command === expectedConfirmationFrameCommand &&
							(typeof sessionID === "undefined" ||
								sessionID === (notificationFrame as IGW_FRAME_COMMAND).SessionID)
						) {
							debug(`sendFrameAsync expected frame received: ${stringifyFrame(notificationFrame)}.`);
							resolve(notificationFrame);
						}
					} catch (error) {
						debug(
							`sendFrameAsync error occurred: ${typeof error === "string" ? error : JSON.stringify(error)}.`,
						);
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
				reject!(error);
				return Promise.reject(error as Error);
			}
		} catch (error) {
			debug(
				`sendFrameAsync error occurred (outer): ${typeof error === "string" ? error : JSON.stringify(error)} with frame sent: ${stringifyFrame(frame)}.`,
			);
			return Promise.reject(error as Error);
		}
	}
	/**
	 * Returns a stringified representation of the given frame.
	 * Passwords in the frame are censored.
	 * @param frame The frame to be stringified.
	 * @returns A stringified representation of the given frame.
	 */
	/**
	 * Add a handler to listen for confirmations and notification.
	 * You can provide an optional filter to listen only to
	 * specific events.
	 *
	 * @param {Listener<IGW_FRAME_RCV>} handler Callback functions that is called for an event
	 * @param {GatewayCommand[]} [filter] Array of GatewayCommand entries you want to listen to. Optional.
	 * @returns {Disposable} Returns a Disposable that you can call to remove the handler.
	 */
	public on(handler: Listener<IGW_FRAME_RCV>, filter?: GatewayCommand[]): Disposable {
		debug(`on called with filter: ${JSON.stringify(filter)}.`);
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
	 */
	public onFrameSent(handler: Listener<IGW_FRAME_REQ>, filter?: GatewayCommand[]): Disposable {
		debug(`onFrameSent called with filter: ${JSON.stringify(filter)}.`);
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
		debug(`notifyFrameSent called with frame: ${stringifyFrame(frame)}.`);
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
	 */
	public startKeepAlive(interval: number = 10 * 60 * 1000): void {
		debug(`startKeepAlive called with interval: ${interval}.`);
		// Clear any previous keep-alive timer
		this.stopKeepAlive();

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
	 */
	public stopKeepAlive(): void {
		debug("stopKeepAlive called.");
		if (this.keepAliveTimer) {
			clearInterval(this.keepAliveTimer);
			this.keepAliveTimer = undefined;
			debug("Keep-alive timer stopped.");
		}
	}

	/**
	 * Sends a keep-alive message to the interface
	 * to keep the socket connection open.
	 *
	 * @private
	 * @returns {Promise<void>} Resolves if successful, otherwise reject
	 */
	private async sendKeepAlive(): Promise<void> {
		debug("sendKeepAlive called.");
		await this.sendFrameAsync(new GW_GET_STATE_REQ());
		return;
	}

	/**
	 * Shifts the keep-alive timer to restart its counter.
	 * If no keep-alive timer is active nothing happens.
	 *
	 * @private
	 */
	private shiftKeepAlive(): void {
		debug("shiftKeepAlive called.");
		if (this.keepAliveTimer) {
			clearInterval(this.keepAliveTimer);
			this.startKeepAlive(this.keepAliveInterval);
			debug("Keep-alive timer shifted.");
		}
	}

	private async initSocketAsync(): Promise<void> {
		debug(`initSocketAsync called for host: ${this.host}`);
		await using stack = new AsyncDisposableStack();
		try {
			if (this.sckt === undefined) {
				debug("Creating new socket...");
				await new Promise<void>((resolve, reject) => {
					try {
						const loginErrorHandler = (error: Error): void => {
							debug(`loginErrorHandler called with error: ${error.message}`);
							console.error(`loginErrorHandler: ${error.message}`);
							this.sckt?.off("error", loginErrorHandler);
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
								debug("Secure connection established.");
								// Callback on event "secureConnect":
								// Resolve promise if connection is authorized, otherwise reject it.
								if (this.sckt?.authorized) {
									// Remove login error handler
									this.sckt?.off("error", loginErrorHandler);
									stack.defer(async () => {
										await promiseTimeout(
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
													reject(error as Error);
												}
											}),
											10000,
										);
										this.sckt = undefined;
									});
									resolve();
								} else {
									// Reject promise
									const err = this.sckt?.authorizationError;
									this.sckt = undefined;
									debug(`AuthorizationError: ${err!.message}`);
									console.error(`AuthorizationError: ${err!.message}`);
									reject(err!);
								}
							},
						);

						// Add error handler to reject the promise on login problems
						this.sckt?.on("error", loginErrorHandler);

						const closeEventHandler = (): void => {
							// Socket has been closed -> clean up everything
							this.socketClosedEventHandler();
						};
						this.sckt?.on("close", closeEventHandler);
						stack.defer(() => {
							this.sckt?.off("close", closeEventHandler);
						});

						// Add additional error handler for the lifetime of the socket
						this.sckt?.on("error", closeEventHandler);
						stack.defer(() => {
							this.sckt?.off("error", closeEventHandler);
						});

						// React to end events:
						const endEventHandler = (): void => {
							if (this.sckt?.allowHalfOpen) {
								this.sckt?.end(() => {
									this.socketClosedEventHandler();
								});
							}
						};
						this.sckt?.on("end", endEventHandler);
						stack.defer(() => {
							this.sckt?.off("end", endEventHandler);
						});

						// Timeout of socket:
						const timeoutEventHandler = (): void => {
							this.sckt?.end(() => {
								this.socketClosedEventHandler();
							});
						};
						this.sckt?.on("timeout", timeoutEventHandler);
						stack.defer(() => {
							this.sckt?.off("timeout", timeoutEventHandler);
						});
					} catch (error) {
						debug(`initSocketAsync inner catch: ${JSON.stringify(error)}`);
						console.error(`initSocketAsync inner catch: ${JSON.stringify(error)}`);
						reject(error as Error);
					}
				});
				this._disposableStack.use(stack.move());
			} else {
				debug("Socket already exists.");
				return Promise.resolve();
			}
		} catch (error) {
			console.error(`initSocketAsync outer catch: ${JSON.stringify(error)}`);
			return Promise.reject(error as Error);
		}
	}

	private socketClosedEventHandler(): void {
		debug("socketClosedEventHandler called.");
		// Socket has been closed -> clean up everything
		this.stopKeepAlive();
		// Remove all listeners
		this.sckt?.removeAllListeners();
		this.klfProtocol = undefined;
		this.sckt = undefined;
		debug("Socket closed.");
	}

	private checkServerIdentity(host: string, cert: PeerCertificate): Error | undefined {
		debug(`checkServerIdentity called for host ${host} with fingerprint ${cert.fingerprint}.`);
		if (cert.fingerprint === this.fingerprint) return undefined;
		else return checkServerIdentityOriginal(host, cert);
	}
}
