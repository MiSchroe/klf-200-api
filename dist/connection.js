"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const tls_1 = require("tls");
const KLF200SocketProtocol_1 = require("./KLF200-API/KLF200SocketProtocol");
const common_1 = require("./KLF200-API/common");
const path_1 = require("path");
const GW_ERROR_NTF_1 = require("./KLF200-API/GW_ERROR_NTF");
const _1 = require(".");
const promise_timeout_1 = require("promise-timeout");
'use strict';
const FINGERPRINT = "02:8C:23:A0:89:2B:62:98:C4:99:00:5B:D2:E7:2E:0A:70:3D:71:6A";
const ca = fs_1.readFileSync(path_1.join(__dirname, "../velux-cert.pem"));
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
class Connection {
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
    constructor(host, CA = ca, fingerprint = FINGERPRINT) {
        this.host = host;
        this.CA = CA;
        this.fingerprint = fingerprint;
    }
    get KLF200SocketProtocol() {
        return this.klfProtocol;
    }
    /**
     * Logs in to the KLF interface by sending the GW_PASSWORD_ENTER_REQ.
     *
     * @param {string} password The password needed for login. The factory default password is velux123.
     * @param {number} [timeout=60] A timeout in seconds. After the timeout the returned promise will be rejected.
     * @returns {Promise<void>} Returns a promise that resolves to true on success or rejects with the errors.
     * @memberof Connection
     */
    loginAsync(password, timeout = 60) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return promise_timeout_1.timeout(new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield this.initSocketAsync();
                        this.klfProtocol = new KLF200SocketProtocol_1.KLF200SocketProtocol(this.sckt);
                        const passwordCFM = yield this.sendFrameAsync(new _1.GW_PASSWORD_ENTER_REQ(password));
                        if (passwordCFM.Status !== common_1.GW_COMMON_STATUS.SUCCESS) {
                            reject(new Error("Login failed."));
                        }
                        else {
                            resolve();
                        }
                    }
                    catch (error) {
                        reject(error);
                    }
                })), timeout * 1000);
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * Logs out from the KLF interface and closes the socket.
     *
     * @param {number} [timeout=10] A timeout in seconds. After the timeout the returned promise will be rejected.
     * @returns {Promise<void>} Returns a promise that resolves to true on successful logout or rejects with the errors.
     * @memberof Connection
     */
    logoutAsync(timeout = 10) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.sckt) {
                    if (this.klfProtocol) {
                        this.klfProtocol = undefined;
                    }
                    return promise_timeout_1.timeout(new Promise((resolve) => {
                        // Close socket
                        this.sckt.once("close", () => {
                            this.sckt = undefined;
                            resolve();
                        }).end();
                    }), timeout * 1000);
                }
                else {
                    return Promise.resolve();
                }
            }
            catch (error) {
                Promise.reject(error);
            }
        });
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
    sendFrameAsync(frame, timeout = 10) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const frameName = common_1.GatewayCommand[frame.Command];
                const expectedConfirmationFrameName = frameName.slice(0, -3) + "CFM";
                const expectedConfirmationFrameCommand = common_1.GatewayCommand[expectedConfirmationFrameName];
                const sessionID = frame instanceof common_1.GW_FRAME_COMMAND_REQ ? frame.SessionID : undefined;
                return promise_timeout_1.timeout(new Promise((resolve, reject) => {
                    try {
                        const cfmHandler = this.klfProtocol.on((frame) => {
                            try {
                                if (frame instanceof GW_ERROR_NTF_1.GW_ERROR_NTF) {
                                    cfmHandler.dispose();
                                    reject(new Error(frame.getError()));
                                }
                                else if (frame.Command === expectedConfirmationFrameCommand && (typeof sessionID === "undefined" || sessionID === frame.SessionID)) {
                                    cfmHandler.dispose();
                                    resolve(frame);
                                }
                            }
                            catch (error) {
                                reject(error);
                            }
                        });
                        this.klfProtocol.write(frame.Data);
                    }
                    catch (error) {
                        reject(error);
                    }
                }), timeout * 1000);
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
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
    on(handler, filter) {
        if (typeof filter === "undefined") {
            return this.klfProtocol.on(handler);
        }
        else {
            return this.klfProtocol.on((frame) => {
                if (filter.indexOf(frame.Command) >= 0) {
                    handler(frame);
                }
            });
        }
    }
    initSocketAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.sckt === undefined) {
                    return new Promise((resolve, reject) => {
                        this.sckt = tls_1.connect(common_1.KLF200_PORT, this.host, {
                            rejectUnauthorized: true,
                            ca: [this.CA],
                            checkServerIdentity: (host, cert) => this.checkServerIdentity(host, cert)
                        }, () => {
                            // Callback on event "secureConnect":
                            // Resolve promise if connection is authorized, otherwise reject it.
                            if (this.sckt.authorized) {
                                resolve();
                            }
                            else {
                                const err = this.sckt.authorizationError;
                                this.sckt = undefined;
                                reject(err);
                            }
                        });
                    });
                }
                else {
                    return Promise.resolve();
                }
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    checkServerIdentity(host, cert) {
        if (cert.fingerprint === this.fingerprint)
            return undefined;
        else
            return tls_1.checkServerIdentity(host, cert);
    }
}
exports.Connection = Connection;
