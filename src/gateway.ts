import { connection } from "./connection";
import { GW_PASSWORD_CHANGE_CFM } from "./KLF200-API/GW_PASSWORD_CHANGE_CFM";
import { GW_PASSWORD_CHANGE_REQ } from "./KLF200-API/GW_PASSWORD_CHANGE_REQ";
import { GW_COMMON_STATUS, GW_INVERSE_STATUS } from "./KLF200-API/common";
import { SoftwareVersion, GW_GET_VERSION_CFM } from "./KLF200-API/GW_GET_VERSION_CFM";
import { GW_GET_VERSION_REQ } from "./KLF200-API/GW_GET_VERSION_REQ";
import { GW_GET_PROTOCOL_VERSION_CFM } from "./KLF200-API/GW_GET_PROTOCOL_VERSION_CFM";
import { GW_GET_PROTOCOL_VERSION_REQ } from "./KLF200-API/GW_GET_PROTOCOL_VERSION_REQ";
import { GatewayState, GatewaySubState, GW_GET_STATE_CFM } from "./KLF200-API/GW_GET_STATE_CFM";
import { GW_GET_STATE_REQ } from "./KLF200-API/GW_GET_STATE_REQ";
import { GW_SET_UTC_REQ } from "./KLF200-API/GW_SET_UTC_REQ";
import { GW_RTC_SET_TIME_ZONE_CFM } from "./KLF200-API/GW_RTC_SET_TIME_ZONE_CFM";
import { GW_RTC_SET_TIME_ZONE_REQ } from "./KLF200-API/GW_RTC_SET_TIME_ZONE_REQ";

'use strict';

/**
 * Provides basic functions to control general functions of the KLF interface.
 *
 * @export
 * @class gateway
 */
export class gateway {
    /**
     *Creates an instance of gateway.
     * @param {connection} connection The connection that will be used to send and receive commands.
     * @memberof gateway
     */
    constructor(readonly connection: connection) {}

    /**
     * Changes the password of the KLF interface.
     *
     * @param {string} oldPassword Provide the old password.
     * @param {string} newPassword Provide a new password. The password must not exceed 32 characters.
     * @returns {Promise<boolean>} Returns a promise that fulfills to true if the password has been changed successfully.
     * @memberof gateway
     */
    async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
        try {
            const passwordChanged: GW_PASSWORD_CHANGE_CFM = <GW_PASSWORD_CHANGE_CFM> await this.connection.sendFrame(new GW_PASSWORD_CHANGE_REQ(oldPassword, newPassword));
            return passwordChanged.Status === GW_COMMON_STATUS.SUCCESS;
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Reads the version information from the KLF interface, e.g. the firmware software version number
     *
     * @returns {Promise<{SoftwareVersion: SoftwareVersion, HardwareVersion: number, ProductGroup: number, ProductType: number}>}
     *          Returns an object with the several version numbers.
     * @memberof gateway
     */
    async getVersion(): Promise<{SoftwareVersion: SoftwareVersion, HardwareVersion: number, ProductGroup: number, ProductType: number}> {
        try {
            const versionInformation = <GW_GET_VERSION_CFM> await this.connection.sendFrame(new GW_GET_VERSION_REQ());
            return {
                SoftwareVersion: versionInformation.SoftwareVersion,
                HardwareVersion: versionInformation.HardwareVersion,
                ProductGroup: versionInformation.ProductGroup,
                ProductType: versionInformation.ProductType
            };
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Reads the protocol version information from the KLF interface.
     * 
     * @returns {Promise<{MajorVersion: number, MinorVersion: number}>}
     *          Returns an object with major and minor version number of the protocol.
     * @memberof gateway
     */
    async getProtocolVersion(): Promise<{MajorVersion: number, MinorVersion: number}> {
        try {
            const versionInformation = <GW_GET_PROTOCOL_VERSION_CFM> await this.connection.sendFrame(new GW_GET_PROTOCOL_VERSION_REQ());
            return {
                MajorVersion: versionInformation.MajorVersion,
                MinorVersion: versionInformation.MinorVersion
            };
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Gets the current state of the gateway.
     *
     * @returns {Promise<{GatewayState: GatewayState, SubState: GatewaySubState}>}
     *          Returns the current state and sub-state of the gateway.
     * @memberof gateway
     */
    async getState(): Promise<{GatewayState: GatewayState, SubState: GatewaySubState}> {
        try {
            const state = <GW_GET_STATE_CFM> await this.connection.sendFrame(new GW_GET_STATE_REQ());
            return {
                GatewayState: state.GatewayState,
                SubState: state.GatewaySubState
            };
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Sets the internal real time clock of the interface.
     *
     * @param {Date} [utcTimestamp=new Date()] The new date that should be set. Default is the current date/time.
     * @returns {Promise<void>}
     * @memberof gateway
     */
    async setUTCDateTime(utcTimestamp: Date = new Date()): Promise<void> {
        try {
            await this.connection.sendFrame(new GW_SET_UTC_REQ(utcTimestamp));
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Sets the time zone of the interface.
     *
     * @param {string} timeZone A string describing the time zone. See the KLF API documentation for details. Example: :GMT+1:GMT+2:0060:(1994)040102-0:110102-0
     * @returns {Promise<void>} 
     * @memberof gateway
     */
    async setTimeZone(timeZone: string): Promise<void> {
        try {
            const timeZoneCFM = <GW_RTC_SET_TIME_ZONE_CFM> await this.connection.sendFrame(new GW_RTC_SET_TIME_ZONE_REQ(timeZone));
            if (timeZoneCFM.Status !== GW_INVERSE_STATUS.SUCCESS)
                throw "Error setting time zone.";
        } catch (error) {
            return Promise.reject(error);
        }
    }
}