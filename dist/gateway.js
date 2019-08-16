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
const GW_RTC_SET_TIME_ZONE_REQ_1 = require("./KLF200-API/GW_RTC_SET_TIME_ZONE_REQ");
const GW_REBOOT_REQ_1 = require("./KLF200-API/GW_REBOOT_REQ");
const GW_SET_FACTORY_DEFAULT_REQ_1 = require("./KLF200-API/GW_SET_FACTORY_DEFAULT_REQ");
const GW_LEAVE_LEARN_STATE_REQ_1 = require("./KLF200-API/GW_LEAVE_LEARN_STATE_REQ");
const GW_GET_NETWORK_SETUP_REQ_1 = require("./KLF200-API/GW_GET_NETWORK_SETUP_REQ");
const GW_SET_NETWORK_SETUP_REQ_1 = require("./KLF200-API/GW_SET_NETWORK_SETUP_REQ");
const GW_HOUSE_STATUS_MONITOR_ENABLE_REQ_1 = require("./KLF200-API/GW_HOUSE_STATUS_MONITOR_ENABLE_REQ");
const GW_HOUSE_STATUS_MONITOR_DISABLE_REQ_1 = require("./KLF200-API/GW_HOUSE_STATUS_MONITOR_DISABLE_REQ");
"use strict";
/**
 * Provides basic functions to control general functions of the KLF interface.
 *
 * @export
 * @class Gateway
 */
class Gateway {
    /**
     *Creates an instance of Gateway.
     * @param {IConnection} connection The connection that will be used to send and receive commands.
     * @memberof Gateway
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
     * @memberof Gateway
     */
    changePasswordAsync(oldPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const passwordChanged = yield this.connection.sendFrameAsync(new GW_PASSWORD_CHANGE_REQ_1.GW_PASSWORD_CHANGE_REQ(oldPassword, newPassword));
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
     * @memberof Gateway
     */
    getVersionAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const versionInformation = yield this.connection.sendFrameAsync(new GW_GET_VERSION_REQ_1.GW_GET_VERSION_REQ());
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
     * @memberof Gateway
     */
    getProtocolVersionAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const versionInformation = yield this.connection.sendFrameAsync(new GW_GET_PROTOCOL_VERSION_REQ_1.GW_GET_PROTOCOL_VERSION_REQ());
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
     * @memberof Gateway
     */
    getStateAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const state = yield this.connection.sendFrameAsync(new GW_GET_STATE_REQ_1.GW_GET_STATE_REQ());
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
     * @memberof Gateway
     */
    setUTCDateTimeAsync(utcTimestamp = new Date()) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.connection.sendFrameAsync(new GW_SET_UTC_REQ_1.GW_SET_UTC_REQ(utcTimestamp));
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * Sets the time zone of the interface.
     *
     * @param {string} timeZone A string describing the time zone. See the KLF API documentation for details. Example: :GMT+1:GMT+2:0060:(1994)040102-0:110102-0
     * @returns {Promise<void>}
     * @memberof Gateway
     */
    setTimeZoneAsync(timeZone) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const timeZoneCFM = yield this.connection.sendFrameAsync(new GW_RTC_SET_TIME_ZONE_REQ_1.GW_RTC_SET_TIME_ZONE_REQ(timeZone));
                if (timeZoneCFM.Status !== common_1.GW_INVERSE_STATUS.SUCCESS)
                    throw new Error("Error setting time zone.");
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * Reboots the KLF interface. After reboot the socket has to be reconnected.
     *
     * @returns {Promise<void>}
     * @memberof Gateway
     */
    rebootAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.connection.sendFrameAsync(new GW_REBOOT_REQ_1.GW_REBOOT_REQ());
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * Resets the KLF interface to the factory default settings. After 30 seconds you can reconnect.
     *
     * @returns {Promise<void>}
     * @memberof Gateway
     */
    factoryResetAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.connection.sendFrameAsync(new GW_SET_FACTORY_DEFAULT_REQ_1.GW_SET_FACTORY_DEFAULT_REQ());
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * If the gateway has been put into learn state by pressing the learn button
     * then leaveLearnStateAsync can be called to leave the learn state.
     *
     * @returns {Promise<void>}
     * @memberof Gateway
     */
    leaveLearnStateAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.connection.sendFrameAsync(new GW_LEAVE_LEARN_STATE_REQ_1.GW_LEAVE_LEARN_STATE_REQ());
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * Get the network settings
     *
     * @returns {Promise<{IPAddress: string, Mask: string, DefaultGateway: string, DHCP: boolean}>}
     *          Returns an object with IP address, mask and default gateway and if DHCP is used.
     * @memberof Gateway
     */
    getNetworkSettingsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const networkSettings = yield this.connection.sendFrameAsync(new GW_GET_NETWORK_SETUP_REQ_1.GW_GET_NETWORK_SETUP_REQ());
                return {
                    IPAddress: networkSettings.IPAddress,
                    Mask: networkSettings.Mask,
                    DefaultGateway: networkSettings.DefaultGateway,
                    DHCP: networkSettings.DHCP
                };
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    setNetworkSettingsAsync(DHCP, IPAddress, Mask, DefaultGateway) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (DHCP) {
                    IPAddress = Mask = DefaultGateway = "0.0.0.0";
                }
                yield this.connection.sendFrameAsync(new GW_SET_NETWORK_SETUP_REQ_1.GW_SET_NETWORK_SETUP_REQ(DHCP, IPAddress, Mask, DefaultGateway));
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * Enables the house status monitor.
     *
     * With the house status monitor enabled you can get
     * notifications of changes of products.
     *
     * @returns {Promise<void>}
     * @memberof Gateway
     */
    enableHouseStatusMonitorAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.connection.sendFrameAsync(new GW_HOUSE_STATUS_MONITOR_ENABLE_REQ_1.GW_HOUSE_STATUS_MONITOR_ENABLE_REQ());
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * Disables the house status monitor.
     *
     * After disabling the house status monitor you will
     * no longer get notifications of changes.
     *
     * @returns {Promise<void>}
     * @memberof Gateway
     */
    disableHouseStatusMonitorAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.connection.sendFrameAsync(new GW_HOUSE_STATUS_MONITOR_DISABLE_REQ_1.GW_HOUSE_STATUS_MONITOR_DISABLE_REQ());
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
}
exports.Gateway = Gateway;
//# sourceMappingURL=gateway.js.map