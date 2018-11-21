import { readFileSync } from "fs";
import { PeerCertificate, checkServerIdentity as checkServerIdentityOriginal, connect, TLSSocket } from "tls";
import { KLF200SocketProtocol } from "./KLF200-API/KLF200SocketProtocol";
import { IGW_FRAME_RCV, IGW_FRAME_REQ, GatewayCommand, GW_COMMON_STATUS, KLF200_PORT, GW_FRAME_COMMAND_REQ, IGW_FRAME_COMMAND } from "./KLF200-API/common";
import { join } from "path";
import { GW_ERROR_NTF } from "./KLF200-API/GW_ERROR_NTF";
import { GW_PASSWORD_ENTER_CFM, GW_PASSWORD_ENTER_REQ } from ".";
import { Disposable, Listener } from "./utils/TypedEvent";

'use strict';

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
     * @returns {Promise<void>} Returns a promise that resolves to true on success or rejects with the errors.
     * @memberof IConnection
     */
    loginAsync(password: string): Promise<void>;

    /**
     * Logs out from the KLF interface and closes the socket.
     *
     * @returns {Promise<void>} Returns a promise that resolves to true on successful logout or rejects with the errors.
     * @memberof IConnection
     */
    logoutAsync(): Promise<void>;

    /**
     * Sends a request frame to the KLF interface.
     *
     * @param {IGW_FRAME_REQ} frame The frame that should be sent to the KLF interface.
     * @returns {Promise<IGW_FRAME_RCV>} Returns a promise with the corresponding confirmation message as value.
     *                                   In case of an error frame the promise will be rejected with the error number.
     *                                   If the request frame is a command (with a SessionID) than the promise will be
     *                                   resolved by the corresponding confirmation frame with a matching session ID.
     * @memberof IConnection
     */
    sendFrameAsync(frame: IGW_FRAME_REQ): Promise<IGW_FRAME_RCV>;

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
     * Gets the underlying socket protocol handler.
     *
     * @type {KLF200SocketProtocol}
     * @memberof IConnection
     */
    readonly KLF200SocketProtocol?: KLF200SocketProtocol;
}

const FINGERPRINT = "02:8C:23:A0:89:2B:62:98:C4:99:00:5B:D2:E7:2E:0A:70:3D:71:6A";
const ca = readFileSync(join(__dirname, "../velux-cert.pem"));

/**
 * The Connection class is used to handle the communication with the Velux KLF interface.
 * It provides login and logout functionality and provides methods to run other commands
 * on the socket API.
 * @example
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
 *
 * @export
 * @class Connection
 */
export class Connection implements IConnection {
    private sckt?: TLSSocket;
    private klfProtocol?: KLF200SocketProtocol;

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
    constructor(readonly host: string, readonly CA: Buffer = ca, readonly fingerprint: string = FINGERPRINT) {
    }

    public get KLF200SocketProtocol(): KLF200SocketProtocol | undefined {
        return this.klfProtocol;
    }

    /**
     * Logs in to the KLF interface by sending the GW_PASSWORD_ENTER_REQ.
     *
     * @param {string} password The password needed for login. The factory default password is velux123.
     * @returns {Promise<void>} Returns a promise that resolves to true on success or rejects with the errors.
     * @memberof Connection
     */
    public async loginAsync(password: string): Promise<void> {
        try {
            await this.initSocketAsync();
            this.klfProtocol = new KLF200SocketProtocol(<TLSSocket>this.sckt);
            const passwordCFM = <GW_PASSWORD_ENTER_CFM> await this.sendFrameAsync(new GW_PASSWORD_ENTER_REQ(password));
            if (passwordCFM.Status !== GW_COMMON_STATUS.SUCCESS) {
                return Promise.reject("Login failed.");
            } else {
                return Promise.resolve();
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Logs out from the KLF interface and closes the socket.
     *
     * @returns {Promise<void>} Returns a promise that resolves to true on successful logout or rejects with the errors.
     * @memberof Connection
     */
    public async logoutAsync(): Promise<void> {
        try {
            if (this.sckt) {
                if (this.klfProtocol) {
                    this.klfProtocol = undefined;
                }
                return new Promise<void>(
                    (resolve) => {
                        // Close socket
                        (<TLSSocket>this.sckt).once("close", () => {
                            this.sckt = undefined;
                            resolve();
                        }).end();
                    }
                );
            }
            else {
                return Promise.resolve();
            }
        } catch (error) {
            Promise.reject(error);
        }
    }

    /**
     * Sends a request frame to the KLF interface.
     *
     * @param {IGW_FRAME_REQ} frame The frame that should be sent to the KLF interface.
     * @returns {Promise<IGW_FRAME_RCV>} Returns a promise with the corresponding confirmation message as value.
     *                                   In case of an error frame the promise will be rejected with the error number.
     *                                   If the request frame is a command (with a SessionID) than the promise will be
     *                                   resolved by the corresponding confirmation frame with a matching session ID.
     * @memberof Connection
     */
    public async sendFrameAsync(frame: IGW_FRAME_REQ): Promise<IGW_FRAME_RCV> {
        try {
            const frameName = GatewayCommand[frame.Command];
            const expectedConfirmationFrameName: keyof typeof GatewayCommand = frameName.slice(0, -3) + "CFM" as keyof typeof GatewayCommand;
            const expectedConfirmationFrameCommand = GatewayCommand[expectedConfirmationFrameName];
            const sessionID = frame instanceof GW_FRAME_COMMAND_REQ ? frame.SessionID : undefined;

            return new Promise<IGW_FRAME_RCV>((resolve, reject) => {
                const cfmHandler = (this.klfProtocol as KLF200SocketProtocol).on((frame) => {
                    if (frame.Command === GatewayCommand.GW_ERROR_NTF) {
                        cfmHandler.dispose();
                        reject((frame as GW_ERROR_NTF).ErrorNumber);
                    }
                    else if (frame.Command === expectedConfirmationFrameCommand && (typeof sessionID === "undefined" || sessionID === (frame as IGW_FRAME_COMMAND).SessionID)) {
                        cfmHandler.dispose();
                        resolve(frame);
                    }
                });
                (this.klfProtocol as KLF200SocketProtocol).write(frame.Data);
            });
        }
        catch (error) {
            return Promise.reject(error);
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
        }
        else {
            return (this.klfProtocol as KLF200SocketProtocol).on((frame) => {
                if (filter.indexOf(frame.Command) >= 0) {
                    handler(frame);
                }
            });
        }
    }

    private async initSocketAsync(): Promise<void> {
        try {
            if (this.sckt === undefined) {
                return new Promise<void>(
                    (resolve, reject) => {
                        this.sckt = connect(KLF200_PORT, this.host,
                            {
                            rejectUnauthorized: true,
                            ca: [ this.CA ],
                            checkServerIdentity: (host, cert) => this.checkServerIdentity(host, cert)
                            }, () => {
                                // Callback on event "secureConnect":
                                // Resolve promise if connection is authorized, otherwise reject it.
                                if ((<TLSSocket>this.sckt).authorized) {
                                    resolve();
                                }
                                else {
                                    const err = (<TLSSocket>this.sckt).authorizationError;
                                    this.sckt = undefined;
                                    reject(err);
                                }
                            });
                    }
                );
            }
            else {
                return Promise.resolve();
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    private checkServerIdentity(host: string, cert: PeerCertificate): Error | undefined {
        if (cert.fingerprint === this.fingerprint)
            return undefined
        else
            return checkServerIdentityOriginal(host, cert);
    }
}
