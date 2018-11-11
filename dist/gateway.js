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
const GW_PASSWORD_CHANGE_REQ_1 = require("./KLF200-API/GW_PASSWORD_CHANGE_REQ");
const common_1 = require("./KLF200-API/common");
const GW_GET_VERSION_REQ_1 = require("./KLF200-API/GW_GET_VERSION_REQ");
const GW_GET_PROTOCOL_VERSION_REQ_1 = require("./KLF200-API/GW_GET_PROTOCOL_VERSION_REQ");
const GW_GET_STATE_REQ_1 = require("./KLF200-API/GW_GET_STATE_REQ");
const GW_SET_UTC_REQ_1 = require("./KLF200-API/GW_SET_UTC_REQ");
'use strict';
/**
 * Provides basic functions to control general functions of the KLF interface.
 *
 * @export
 * @class gateway
 */
class gateway {
    /**
     *Creates an instance of gateway.
     * @param {connection} connection The connection that will be used to send and receive commands.
     * @memberof gateway
     */
    constructor(connection) {
        this.connection = connection;
    }
    /**
     * Changes the password of the KLF interface.
     *
     * @param {string} oldPassword Provide the old password.
     * @param {string} newPassword Provide a new password. The password must not exceed 32 characters.
     * @returns {Promise<boolean>} Returns a promise that fulfills to true if the password has been changed successfully.
     * @memberof gateway
     */
    changePassword(oldPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const passwordChanged = yield this.connection.sendFrame(new GW_PASSWORD_CHANGE_REQ_1.GW_PASSWORD_CHANGE_REQ(oldPassword, newPassword));
                return passwordChanged.Status === common_1.GW_COMMON_STATUS.SUCCESS;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * Reads the version information from the KLF interface, e.g. the firmware software version number
     *
     * @returns {Promise<{SoftwareVersion: SoftwareVersion, HardwareVersion: number, ProductGroup: number, ProductType: number}>}
     *          Returns an object with the several version numbers.
     * @memberof gateway
     */
    getVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const versionInformation = yield this.connection.sendFrame(new GW_GET_VERSION_REQ_1.GW_GET_VERSION_REQ());
                return {
                    SoftwareVersion: versionInformation.SoftwareVersion,
                    HardwareVersion: versionInformation.HardwareVersion,
                    ProductGroup: versionInformation.ProductGroup,
                    ProductType: versionInformation.ProductType
                };
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * Reads the protocol version information from the KLF interface.
     *
     * @returns {Promise<{MajorVersion: number, MinorVersion: number}>}
     *          Returns an object with major and minor version number of the protocol.
     * @memberof gateway
     */
    getProtocolVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const versionInformation = yield this.connection.sendFrame(new GW_GET_PROTOCOL_VERSION_REQ_1.GW_GET_PROTOCOL_VERSION_REQ());
                return {
                    MajorVersion: versionInformation.MajorVersion,
                    MinorVersion: versionInformation.MinorVersion
                };
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * Gets the current state of the gateway.
     *
     * @returns {Promise<{GatewayState: GatewayState, SubState: GatewaySubState}>}
     *          Returns the current state and sub-state of the gateway.
     * @memberof gateway
     */
    getState() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const state = yield this.connection.sendFrame(new GW_GET_STATE_REQ_1.GW_GET_STATE_REQ());
                return {
                    GatewayState: state.GatewayState,
                    SubState: state.GatewaySubState
                };
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * Sets the internal real time clock of the interface.
     *
     * @param {Date} [utcTimestamp=new Date()] The new date that should be set. Default is the current date/time.
     * @returns {Promise<void>}
     * @memberof gateway
     */
    setUTCDateTime(utcTimestamp = new Date()) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.connection.sendFrame(new GW_SET_UTC_REQ_1.GW_SET_UTC_REQ(utcTimestamp));
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
}
exports.gateway = gateway;
//# sourceMappingURL=gateway.js.map