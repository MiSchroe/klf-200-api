"use strict";

import { GW_GET_NETWORK_SETUP_REQ } from "./KLF200-API/GW_GET_NETWORK_SETUP_REQ.js";
import { GW_GET_PROTOCOL_VERSION_REQ } from "./KLF200-API/GW_GET_PROTOCOL_VERSION_REQ.js";
import { GatewayState, GatewaySubState } from "./KLF200-API/GW_GET_STATE_CFM.js";
import { GW_GET_STATE_REQ } from "./KLF200-API/GW_GET_STATE_REQ.js";
import { SoftwareVersion } from "./KLF200-API/GW_GET_VERSION_CFM.js";
import { GW_GET_VERSION_REQ } from "./KLF200-API/GW_GET_VERSION_REQ.js";
import { GW_HOUSE_STATUS_MONITOR_DISABLE_REQ } from "./KLF200-API/GW_HOUSE_STATUS_MONITOR_DISABLE_REQ.js";
import { GW_HOUSE_STATUS_MONITOR_ENABLE_REQ } from "./KLF200-API/GW_HOUSE_STATUS_MONITOR_ENABLE_REQ.js";
import { GW_LEAVE_LEARN_STATE_REQ } from "./KLF200-API/GW_LEAVE_LEARN_STATE_REQ.js";
import { GW_PASSWORD_CHANGE_CFM } from "./KLF200-API/GW_PASSWORD_CHANGE_CFM.js";
import { GW_PASSWORD_CHANGE_REQ } from "./KLF200-API/GW_PASSWORD_CHANGE_REQ.js";
import { GW_REBOOT_REQ } from "./KLF200-API/GW_REBOOT_REQ.js";
import { GW_RTC_SET_TIME_ZONE_REQ } from "./KLF200-API/GW_RTC_SET_TIME_ZONE_REQ.js";
import { GW_SET_FACTORY_DEFAULT_REQ } from "./KLF200-API/GW_SET_FACTORY_DEFAULT_REQ.js";
import { GW_SET_NETWORK_SETUP_REQ } from "./KLF200-API/GW_SET_NETWORK_SETUP_REQ.js";
import { GW_SET_UTC_REQ } from "./KLF200-API/GW_SET_UTC_REQ.js";
import { GW_COMMON_STATUS, GW_INVERSE_STATUS } from "./KLF200-API/common.js";
import { IConnection } from "./connection.js";

/**
 * Provides basic functions to control general functions of the KLF interface.
 *
 * @class Gateway
 */
export class Gateway {
	/**
	 *Creates an instance of Gateway.
	 * @param {IConnection} connection The connection that will be used to send and receive commands.
	 */
	constructor(readonly connection: IConnection) {}

	/**
	 * Changes the password of the KLF interface.
	 *
	 * @param {string} oldPassword Provide the old password.
	 * @param {string} newPassword Provide a new password. The password must not exceed 32 characters.
	 * @returns {Promise<boolean>} Returns a promise that fulfills to true if the password has been changed successfully.
	 */
	async changePasswordAsync(oldPassword: string, newPassword: string): Promise<boolean> {
		try {
			const passwordChanged: GW_PASSWORD_CHANGE_CFM = await this.connection.sendFrameAsync(
				new GW_PASSWORD_CHANGE_REQ(oldPassword, newPassword),
			);
			return passwordChanged.Status === GW_COMMON_STATUS.SUCCESS;
		} catch (error) {
			return Promise.reject(error as Error);
		}
	}

	/**
	 * Reads the version information from the KLF interface, e.g. the firmware software version number
	 *
	 * @returns {Promise<{SoftwareVersion: SoftwareVersion, HardwareVersion: number, ProductGroup: number, ProductType: number}>}
	 *          Returns an object with the several version numbers.
	 */
	async getVersionAsync(): Promise<{
		SoftwareVersion: SoftwareVersion;
		HardwareVersion: number;
		ProductGroup: number;
		ProductType: number;
	}> {
		try {
			const versionInformation = await this.connection.sendFrameAsync(new GW_GET_VERSION_REQ());
			return {
				SoftwareVersion: versionInformation.SoftwareVersion,
				HardwareVersion: versionInformation.HardwareVersion,
				ProductGroup: versionInformation.ProductGroup,
				ProductType: versionInformation.ProductType,
			};
		} catch (error) {
			return Promise.reject(error as Error);
		}
	}

	/**
	 * Reads the protocol version information from the KLF interface.
	 *
	 * @returns {Promise<{MajorVersion: number, MinorVersion: number}>}
	 *          Returns an object with major and minor version number of the protocol.
	 */
	async getProtocolVersionAsync(): Promise<{ MajorVersion: number; MinorVersion: number }> {
		try {
			const versionInformation = await this.connection.sendFrameAsync(new GW_GET_PROTOCOL_VERSION_REQ());
			return {
				MajorVersion: versionInformation.MajorVersion,
				MinorVersion: versionInformation.MinorVersion,
			};
		} catch (error) {
			return Promise.reject(error as Error);
		}
	}

	/**
	 * Gets the current state of the gateway.
	 *
	 * @returns {Promise<{GatewayState: GatewayState, SubState: GatewaySubState}>}
	 *          Returns the current state and sub-state of the gateway.
	 */
	async getStateAsync(): Promise<{ GatewayState: GatewayState; SubState: GatewaySubState }> {
		try {
			const state = await this.connection.sendFrameAsync(new GW_GET_STATE_REQ());
			return {
				GatewayState: state.GatewayState,
				SubState: state.GatewaySubState,
			};
		} catch (error) {
			return Promise.reject(error as Error);
		}
	}

	/**
	 * Sets the internal real time clock of the interface.
	 *
	 * @param {Date} [utcTimestamp=new Date()] The new date that should be set. Default is the current date/time.
	 * @returns {Promise<void>}
	 */
	async setUTCDateTimeAsync(utcTimestamp: Date = new Date()): Promise<void> {
		try {
			await this.connection.sendFrameAsync(new GW_SET_UTC_REQ(utcTimestamp));
		} catch (error) {
			return Promise.reject(error as Error);
		}
	}

	/**
	 * Sets the time zone of the interface.
	 *
	 * @param {string} timeZone A string describing the time zone. See the KLF API documentation for details. Example: :GMT+1:GMT+2:0060:(1994)040102-0:110102-0
	 * @returns {Promise<void>}
	 */
	async setTimeZoneAsync(timeZone: string): Promise<void> {
		try {
			const timeZoneCFM = await this.connection.sendFrameAsync(new GW_RTC_SET_TIME_ZONE_REQ(timeZone));
			if (timeZoneCFM.Status !== GW_INVERSE_STATUS.SUCCESS) throw new Error("Error setting time zone.");
		} catch (error) {
			return Promise.reject(error as Error);
		}
	}

	/**
	 * Reboots the KLF interface. After reboot the socket has to be reconnected.
	 *
	 * @returns {Promise<void>}
	 */
	async rebootAsync(): Promise<void> {
		try {
			await this.connection.sendFrameAsync(new GW_REBOOT_REQ());
		} catch (error) {
			return Promise.reject(error as Error);
		}
	}

	/**
	 * Resets the KLF interface to the factory default settings. After 30 seconds you can reconnect.
	 *
	 * @returns {Promise<void>}
	 */
	async factoryResetAsync(): Promise<void> {
		try {
			await this.connection.sendFrameAsync(new GW_SET_FACTORY_DEFAULT_REQ());
		} catch (error) {
			return Promise.reject(error as Error);
		}
	}

	/**
	 * If the gateway has been put into learn state by pressing the learn button
	 * then leaveLearnStateAsync can be called to leave the learn state.
	 *
	 * @returns {Promise<void>}
	 */
	async leaveLearnStateAsync(): Promise<void> {
		try {
			await this.connection.sendFrameAsync(new GW_LEAVE_LEARN_STATE_REQ());
		} catch (error) {
			return Promise.reject(error as Error);
		}
	}

	/**
	 * Get the network settings
	 *
	 * @returns {Promise<{IPAddress: string, Mask: string, DefaultGateway: string, DHCP: boolean}>}
	 *          Returns an object with IP address, mask and default gateway and if DHCP is used.
	 */
	async getNetworkSettingsAsync(): Promise<{
		IPAddress: string;
		Mask: string;
		DefaultGateway: string;
		DHCP: boolean;
	}> {
		try {
			const networkSettings = await this.connection.sendFrameAsync(new GW_GET_NETWORK_SETUP_REQ());
			return {
				IPAddress: networkSettings.IPAddress,
				Mask: networkSettings.Mask,
				DefaultGateway: networkSettings.DefaultGateway,
				DHCP: networkSettings.DHCP,
			};
		} catch (error) {
			return Promise.reject(error as Error);
		}
	}

	/**
	 * Set the KLF interface to use DHCP.
	 *
	 * @param {true} DHCP Set DHCP to true to use DHCP.
	 * @returns {Promise<void>}
	 */
	async setNetworkSettingsAsync(DHCP: true): Promise<void>;
	/**
	 * Set the KLF interface to use a fixed IP address.
	 *
	 * @param {false} DHCP Set DHCP to false to use a fixed IP address.
	 * @param {string} IPAddress The IP address for the KLF interface.
	 * @param {string} Mask The IP mask for the network settings.
	 * @param {string} DefaultGateway The default gateway of your gateway.
	 * @returns {Promise<void>}
	 */
	async setNetworkSettingsAsync(DHCP: false, IPAddress: string, Mask: string, DefaultGateway: string): Promise<void>;
	async setNetworkSettingsAsync(
		DHCP: boolean,
		IPAddress?: string,
		Mask?: string,
		DefaultGateway?: string,
	): Promise<void> {
		try {
			if (DHCP) {
				IPAddress = Mask = DefaultGateway = "0.0.0.0";
			}
			await this.connection.sendFrameAsync(new GW_SET_NETWORK_SETUP_REQ(DHCP, IPAddress, Mask, DefaultGateway));
		} catch (error) {
			return Promise.reject(error as Error);
		}
	}

	/**
	 * Enables the house status monitor.
	 *
	 * With the house status monitor enabled you can get
	 * notifications of changes of products.
	 *
	 * @returns {Promise<void>}
	 */
	async enableHouseStatusMonitorAsync(): Promise<void> {
		try {
			await this.connection.sendFrameAsync(new GW_HOUSE_STATUS_MONITOR_ENABLE_REQ());
		} catch (error) {
			return Promise.reject(error as Error);
		}
	}

	/**
	 * Disables the house status monitor.
	 *
	 * After disabling the house status monitor you will
	 * no longer get notifications of changes.
	 *
	 * @returns {Promise<void>}
	 */
	async disableHouseStatusMonitorAsync(): Promise<void> {
		try {
			await this.connection.sendFrameAsync(new GW_HOUSE_STATUS_MONITOR_DISABLE_REQ());
		} catch (error) {
			return Promise.reject(error as Error);
		}
	}
}
