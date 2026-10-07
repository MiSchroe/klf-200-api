"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ActuatorType, GW_CS_GET_SYSTEMTABLE_DATA_NTF, Manufacturer, PowerSaveMode } from "../../src";

describe("KLF200-API", function () {
	describe("GW_CS_GET_SYSTEMTABLE_DATA_NTF", function () {
		describe("Constructor", function () {
			it("should create without error", function () {
				// prettier-ignore
				const data = Buffer.from([
					16, 0x01, 0x02,
                    // Number of entries
                    1,
                    // Entry
                    0,                      // System table index
                    0x12, 0x34, 0x56,       // Actuator address
                    0x01, 0x01,             // Actuator type/subtype
                    0b01001100,             // Bit array for multiple functions (see official VELUX(tm) documentation for details)
                    0x01,                   // Manufacturer ID
                    0x12, 0x34, 0x56,       // Backbone address
                    0                       // Number of remaining entries
                ]);

				assert.doesNotThrow(() => new GW_CS_GET_SYSTEMTABLE_DATA_NTF(data));
			});

			it("should return the correct number of entries", function () {
				// prettier-ignore
				const data = Buffer.from([
					16, 0x01, 0x02,
                    // Number of entries
                    1,
                    // Entry
                    0,                      // System table index
                    0x12, 0x34, 0x56,       // Actuator address
                    0x01, 0x01,             // Actuator type/subtype
                    0b01001100,             // Bit array for multiple functions (see official VELUX(tm) documentation for details)
                    0x01,                   // Manufacturer ID
                    0x12, 0x34, 0x56,       // Backbone address
                    0                       // Number of remaining entries
                ]);

				const result = new GW_CS_GET_SYSTEMTABLE_DATA_NTF(data);
				assert.strictEqual(result.NumberOfEntries, 1);
			});

			it("should return the correct number of entries", function () {
				// prettier-ignore
				const data = Buffer.from([
					16, 0x01, 0x02,
                    // Number of entries
                    1,
                    // Entry
                    0,                      // System table index
                    0x12, 0x34, 0x56,       // Actuator address
                    0x01, 0x01,             // Actuator type/subtype
                    0b01001100,             // Bit array for multiple functions (see official VELUX(tm) documentation for details)
                    0x01,                   // Manufacturer ID
                    0x12, 0x34, 0x56,       // Backbone address
                    0                       // Number of remaining entries
                ]);

				const result = new GW_CS_GET_SYSTEMTABLE_DATA_NTF(data);
				assert.strictEqual(result.RemainingNumberOfEntries, 0);
			});

			it("should return the entries", function () {
				// prettier-ignore
				const data = Buffer.from([
					16, 0x01, 0x02,
                    // Number of entries
                    1,
                    // Entry
                    0,                      // System table index
                    0x12, 0x34, 0x56,       // Actuator address
                    0x01, 0x01,             // Actuator type/subtype
                    0b01001100,             // Bit array for multiple functions (see official VELUX(tm) documentation for details)
                    0x01,                   // Manufacturer ID
                    0x12, 0x34, 0x56,       // Backbone address
                    0                       // Number of remaining entries
                ]);

				const result = new GW_CS_GET_SYSTEMTABLE_DATA_NTF(data);
				assert.ok(result.SystemTableEntries instanceof Array);
				const entry = result.SystemTableEntries[0];
				assert.strictEqual(entry.SystemTableIndex, 0, "SystemTableIndex");
				assert.strictEqual(entry.ActuatorAddress, 0x123456, "ActuatorAddress");
				assert.strictEqual(entry.ActuatorType, ActuatorType.WindowOpener, "ActuatorType");
				assert.strictEqual(entry.ActuatorSubType, 1, "ActuatorSubType");
				assert.strictEqual(entry.PowerSaveMode, PowerSaveMode.AlwaysAlive, "PowerSaveMode");
				assert.strictEqual(entry.ioMembership, true, "ioMembership");
				assert.strictEqual(entry.RFSupport, true, "RFSupport");
				assert.strictEqual(entry.ActuatorTurnaroundTime, 10, "ActuatorTurnaroundTime");
				assert.strictEqual(entry.Manufacturer, Manufacturer.VELUX, "Manufacturer");
				assert.strictEqual(entry.BackboneReferenceNumber, 0x123456, "BackboneReferenceNumber");
			});

			it("should return an empty array", function () {
				const data = Buffer.from([
					5,
					0x01,
					0x02,
					// Number of entries
					0,
					0, // Number of remaining entries
				]);
				const result = new GW_CS_GET_SYSTEMTABLE_DATA_NTF(data);
				assert.ok(result.SystemTableEntries instanceof Array);
				assert.deepStrictEqual(result.SystemTableEntries, []);
			});
		});
	});
});
