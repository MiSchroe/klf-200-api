import { readFileSync } from "fs";
import { PeerCertificate, checkServerIdentity as checkServerIdentityOriginal, connect, TLSSocket } from "tls";
import { KLF200SocketProtocol } from "./KLF200-API/KLF200SocketProtocol";
import { IGW_FRAME_RCV, IGW_FRAME_REQ, GatewayCommand, GW_COMMON_STATUS, KLF200_PORT } from "./KLF200-API/common";
import { join } from "path";
import { GW_ERROR_NTF } from "./KLF200-API/GW_ERROR_NTF";
import { GW_PASSWORD_ENTER_CFM, GW_PASSWORD_ENTER_REQ } from ".";

'use strict';

const FINGERPRINT = "02:8C:23:A0:89:2B:62:98:C4:99:00:5B:D2:E7:2E:0A:70:3D:71:6A";
const ca = readFileSync(join(__dirname, "../velux-cert.pem"));

/**
 * The connection class is used to handle the communication with the Velux KLF interface.
 * It provides login and logout functionality and provides methods to run other commands
 * on the socket API.
 * @example
 * const connection = require('velux-api').connection;
 *
 * let conn = new connection('velux-klf-12ab');
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
 * @class connection
 */
export class connection {
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
     * @memberof connection
     */
    constructor(readonly host: string, readonly CA: Buffer = ca, readonly fingerprint: string = FINGERPRINT) {
    }

    /**
     * Logs in to the KLF interface by sending the GW_PASSWORD_ENTER_REQ.
     *
     * @param {string} password The password needed for login. The factory default password is velux123.
     * @returns {Promise<void>} Returns a promise that resolves to true on success or rejects with the errors.
     * @memberof connection
     */
    public async loginAsync(password: string): Promise<void> {
        await this.initSocket();
        this.klfProtocol = new KLF200SocketProtocol(<TLSSocket>this.sckt);
        const passwordCFM = <GW_PASSWORD_ENTER_CFM> await this.sendFrame(new GW_PASSWORD_ENTER_REQ(password));
        if (passwordCFM.Status !== GW_COMMON_STATUS.SUCCESS) {
            return Promise.reject("Login failed.");
        } else {
            return Promise.resolve();
        }
    }

    /**
     * Logs out from the KLF interface and closes the socket.
     *
     * @returns {Promise<void>} Returns a promise that resolves to true on successful logout or rejects with the errors.
     * @memberof connection
     */
    public async logoutAsync(): Promise<void> {
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
    }

    /**
     * Sends a request frame to the KLF interface.
     *
     * @param {IGW_FRAME_REQ} frame The frame that should be sent to the KLF interface.
     * @returns {Promise<IGW_FRAME_RCV>} Returns a promise with the corresponding confirmation message as value.
     *                                   In case of an error frame the promise will be rejected with the error number.
     * @memberof connection
     */
    public async sendFrame(frame: IGW_FRAME_REQ): Promise<IGW_FRAME_RCV> {
        const frameName = GatewayCommand[frame.Command];
        const expectedConfirmationFrameName: keyof typeof GatewayCommand = frameName.slice(0, -3) + "CFM" as keyof typeof GatewayCommand;
        const expectedConfirmationFrameCommand = GatewayCommand[expectedConfirmationFrameName];

        return new Promise<IGW_FRAME_RCV>((resolve, reject) => {
            const cfmHandler = (this.klfProtocol as KLF200SocketProtocol).on((frame) => {
                if (frame.Command === GatewayCommand.GW_ERROR_NTF) {
                    cfmHandler.dispose();
                    reject((frame as GW_ERROR_NTF).ErrorNumber);
                }
                else if (frame.Command === expectedConfirmationFrameCommand) {
                    cfmHandler.dispose();
                    resolve(frame);
                }
            });
            (this.klfProtocol as KLF200SocketProtocol).write(frame.Data);
        });
    }

    private async initSocket(): Promise<void> {
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

    private checkServerIdentity(host: string, cert: PeerCertificate): Error | undefined {
        if (cert.fingerprint === this.fingerprint)
            return undefined
        else
            return checkServerIdentityOriginal(host, cert);
    }
}
