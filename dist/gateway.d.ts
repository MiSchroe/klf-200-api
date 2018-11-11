import { connection } from "./connection";
import { SoftwareVersion } from "./KLF200-API/GW_GET_VERSION_CFM";
import { GatewayState, GatewaySubState } from "./KLF200-API/GW_GET_STATE_CFM";
/**
 * Provides basic functions to control general functions of the KLF interface.
 *
 * @export
 * @class gateway
 */
export declare class gateway {
    readonly connection: connection;
    /**
     *Creates an instance of gateway.
     * @param {connection} connection The connection that will be used to send and receive commands.
     * @memberof gateway
     */
    constructor(connection: connection);
    /**
     * Changes the password of the KLF interface.
     *
     * @param {string} oldPassword Provide the old password.
     * @param {string} newPassword Provide a new password. The password must not exceed 32 characters.
     * @returns {Promise<boolean>} Returns a promise that fulfills to true if the password has been changed successfully.
     * @memberof gateway
     */
    changePassword(oldPassword: string, newPassword: string): Promise<boolean>;
    /**
     * Reads the version information from the KLF interface, e.g. the firmware software version number
     *
     * @returns {Promise<{SoftwareVersion: SoftwareVersion, HardwareVersion: number, ProductGroup: number, ProductType: number}>}
     *          Returns an object with the several version numbers.
     * @memberof gateway
     */
    getVersion(): Promise<{
        SoftwareVersion: SoftwareVersion;
        HardwareVersion: number;
        ProductGroup: number;
        ProductType: number;
    }>;
    /**
     * Reads the protocol version information from the KLF interface.
     *
     * @returns {Promise<{MajorVersion: number, MinorVersion: number}>}
     *          Returns an object with major and minor version number of the protocol.
     * @memberof gateway
     */
    getProtocolVersion(): Promise<{
        MajorVersion: number;
        MinorVersion: number;
    }>;
    /**
     * Gets the current state of the gateway.
     *
     * @returns {Promise<{GatewayState: GatewayState, SubState: GatewaySubState}>}
     *          Returns the current state and sub-state of the gateway.
     * @memberof gateway
     */
    getState(): Promise<{
        GatewayState: GatewayState;
        SubState: GatewaySubState;
    }>;
    /**
     * Sets the internal real time clock of the interface.
     *
     * @param {Date} [utcTimestamp=new Date()] The new date that should be set. Default is the current date/time.
     * @returns {Promise<void>}
     * @memberof gateway
     */
    setUTCDateTime(utcTimestamp?: Date): Promise<void>;
}
