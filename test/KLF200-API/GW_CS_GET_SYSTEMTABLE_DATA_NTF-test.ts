'use strict';

import { GW_CS_GET_SYSTEMTABLE_DATA_NTF, ActuatorType, PowerSaveMode, Manufacturer } from "../../src";
import { expect } from "chai";
import 'mocha';

describe("KLF200-API", function() {
    describe("GW_CS_GET_SYSTEMTABLE_DATA_NTF", function () {
        describe("Constructor", function() {
            it("should create without error", function() {
                const data = Buffer.from([16, 0x01, 0x02, 
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
                expect(() => new GW_CS_GET_SYSTEMTABLE_DATA_NTF(data)).not.to.throw;
            });

            it("should return the correct number of entries", function() {
                const data = Buffer.from([16, 0x01, 0x02, 
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
                expect(result.NumberOfEntries).to.equal(1);
            });

            it("should return the correct number of entries", function() {
                const data = Buffer.from([16, 0x01, 0x02, 
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
                expect(result.RemainingNumberOfEntries).to.equal(0);
            });

            it("should return the entries", function() {
                const data = Buffer.from([16, 0x01, 0x02, 
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
                expect(result.SystemTableEntries).to.be.an.instanceOf(Array);
                const entry = result.SystemTableEntries[0];
                expect(entry.SystemTableIndex).to.equal(0, "SystemTableIndex");
                expect(entry.ActuatorAddress).to.equal(0x123456, "ActuatorAddress");
                expect(entry.ActuatorType).to.equal(ActuatorType.WindowOpener, "ActuatorType");
                expect(entry.ActuatorSubType).to.equal(1, "ActuatorSubType");
                expect(entry.PowerSaveMode).to.equal(PowerSaveMode.AlwaysAlive, "PowerSaveMode");
                expect(entry.ioMembership).to.equal(true, "ioMembership");
                expect(entry.RFSupport).to.equal(true, "RFSupport");
                expect(entry.ActuatorTurnaroundTime).to.equal(10, "ActuatorTurnaroundTime");
                expect(entry.Manufacturer).to.equal(Manufacturer.VELUX, "Manufacturer");
                expect(entry.BackboneReferenceNumber).to.equal(0x123456, "BackboneReferenceNumber");
            });

            it("should return an empty array", function() {
                const data = Buffer.from([5, 0x01, 0x02, 
                    // Number of entries
                    0,
                    0                       // Number of remaining entries
                ]);
                const result = new GW_CS_GET_SYSTEMTABLE_DATA_NTF(data);
                expect(result.SystemTableEntries).to.be.an.instanceOf(Array).and.have.members([]);
            });
        });
    });
});