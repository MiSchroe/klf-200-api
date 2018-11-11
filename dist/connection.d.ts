/// <reference types="node" />
import { IGW_FRAME_RCV, IGW_FRAME_REQ } from "./KLF200-API/common";
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
export declare class connection {
    readonly host: string;
    readonly CA: Buffer;
    readonly fingerprint: string;
    private sckt?;
    private klfProtocol?;
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
    constructor(host: string, CA?: Buffer, fingerprint?: string);
    /**
     * Logs in to the KLF interface by sending the GW_PASSWORD_ENTER_REQ.
     *
     * @param {string} password The password needed for login. The factory default password is velux123.
     * @returns {Promise<void>} Returns a promise that resolves to true on success or rejects with the errors.
     * @memberof connection
     */
    loginAsync(password: string): Promise<void>;
    /**
     * Logs out from the KLF interface and closes the socket.
     *
     * @returns {Promise<void>} Returns a promise that resolves to true on successful logout or rejects with the errors.
     * @memberof connection
     */
    logoutAsync(): Promise<void>;
    /**
     * Sends a request frame to the KLF interface.
     *
     * @param {IGW_FRAME_REQ} frame The frame that should be sent to the KLF interface.
     * @returns {Promise<IGW_FRAME_RCV>} Returns a promise with the corresponding confirmation message as value.
     *                                   In case of an error frame the promise will be rejected with the error number.
     * @memberof connection
     */
    sendFrame(frame: IGW_FRAME_REQ): Promise<IGW_FRAME_RCV>;
    private initSocket;
    private checkServerIdentity;
}
