import { readFileSync } from "fs";
import { PeerCertificate, checkServerIdentity as checkServerIdentityOriginal, connect, TLSSocket } from "tls";
import { KLF200SocketProtocol } from "./KLF200-API/KLF200SocketProtocol";
import { IGW_FRAME_RCV, IGW_FRAME_REQ, GatewayCommand, GW_COMMON_STATUS, KLF200_PORT } from "./KLF200-API/common";
import { GW_PASSWORD_ENTER_REQ } from "./KLF200-API/GW_PASSWORD_ENTER_REQ";
import { GW_PASSWORD_ENTER_CFM } from "./KLF200-API/GW_PASSWORD_ENTER_CFM";
import { join } from "path";
import { GW_ERROR_NTF } from "./KLF200-API/GW_ERROR_NTF";

'use strict';

const FINGERPRINT = "02:8C:23:A0:89:2B:62:98:C4:99:00:5B:D2:E7:2E:0A:70:3D:71:6A";
const ca = readFileSync(join(__dirname, "../velux-cert.pem"));

export class connection {
    private sckt?: TLSSocket;
    private klfProtocol?: KLF200SocketProtocol;

    constructor(readonly host: string, readonly CA: Buffer = ca, readonly fingerprint: string = FINGERPRINT) {
    }

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

// /**
//  * Creates a new connection object that connect to the given host.
//  * @param {string} host URL of the host name, e.g. http://velux-klf-12ab
//  * @constructor
//  * @description
//  * The connection class is used to handle the communication with the Velux KLF interface.
//  * It provides login and logout functionality and provides methods to run other commands
//  * on the REST API.
//  * @example
//  * const connection = require('velux-api').connection;
//  *
//  * let conn = new connection('http://velux-klf-12ab');
//  * conn.loginAsync('velux123')
//  *     .then(() => {
//  *         ... do some other stuff ...
//  *         return conn.logoutAsync();
//  *      })
//  *     .catch((err) => {    // always close the connection
//  *         return conn.logoutAsync().reject(err);
//  *      });
//  */
// function connection(host) {
//     this.host = host;
// }

// /**
//  * Logs in to the KLF interface and provides a token for further calls to the REST API.
//  * @param {string} password The password needed for login. The factory default password is velux123.
//  * @return {Promise} Returns a promise that resolves to true on success or rejects with the errors.
//  */
// connection.prototype.loginAsync = function (password) {
//     if (this.token)
//         delete this.token;

//     return this.postAsync(urlBuilder.authentication, 'login', { password: password })
//         .then((res) => {
//             if (res.token)
//                 this.token = res.token;
//             else
//                 throw new Error('No login token found');

//             return true;
//         });
// };

// /**
//  * Logs out from the KLF interface.
//  * @return {Promise} Returns a promise that resolves to true on successful logout or rejects with the errors.
//  */
// connection.prototype.logoutAsync = function () {
//     return this.postAsync(urlBuilder.authentication, 'logout').then(() => {
//         if (this.token)
//             delete this.token;

//         return true;
//     });
// };

// /**
//  * Calls a REST API function on the KLF interface.
//  * @param {string} functionName The name of the function interface, e.g. auth or products.
//  *                              You can use {@link urlBuilder} to get the valid function names.
//  * @param {string} action The name of the action, e.g. login, logout.
//  * @param {object} [params] The parameter data for your action, e.g. the password needed for login.
//  * @return {Promise} Returns a promise that resolves to the result of the http request.
//  */
// connection.prototype.postAsync = function (functionName, action, params = null) {
//     try {

//         let data = {
//             action: action,
//             params: params || {}
//         };

//         let req = request.post(this.host + urlBuilder.getPath(functionName));
//         // Add authorization token
//         if (this.token) {
//             req = req.auth(this.token, { type: 'bearer' });
//         }

//         return Promise.resolve(
//             req
//             .parse(this.cleanJSONParse)
//             .send(data)
//             .then((res) => {
//                 if (!res || !res.body || !res.body.result ||
//                     res.body.errors && Array.isArray(res.body.errors) && res.body.errors.length > 0)
//                     throw new Error(res.body.errors);
//                 else
//                     return res.body;
//             })
//         );

//     } catch (error) {
//         return Promise.reject(error);
//     }
// };

// /**
//  * @callback superAgentParserCallback
//  * @param {Error} err
//  * @param {any} body
//  */

// /**
//  * Cleans the http-response from invalid characters and returns a JSON object.
//  * Is implemented as a parser for {@link superagent}.
//  * @internal
//  * @param {SuperAgentStatic.response} res The response object.
//  * @param {superAgentParserCallback} fn The callback function called by the parser.
//  */
// connection.prototype.cleanJSONParse = function (res, fn) {
//     res.text = '';
//     res.setEncoding('utf8');
//     res.on('data', function (chunk) { res.text += chunk; });
//     res.on('end', function () {
//         try {
//             let responseBody = res.text;
//             let startPositionOfJSONObject = responseBody.indexOf('{');
//             if (startPositionOfJSONObject > 0)
//                 responseBody = responseBody.substring(startPositionOfJSONObject);
//             fn(null, JSON.parse(responseBody));
//         } catch (err) {
//             fn(err);
//         }
//     });
// };

// module.exports = connection;