"use strict";

import { expect } from "chai";
import 'mocha';
import { GW_GET_ALL_NODES_INFORMATION_NTF, Velocity, NodeVariation, ActuatorType, PowerSaveMode, NodeOperatingState, ActuatorAlias } from "../../src";

describe("KLF200-API", function() {
    describe("GW_GET_ALL_NODES_INFORMATION_NTF", function() {
        describe("Constructor", function() {
            const data = Buffer.from([127, 0x02, 0x04, 
                // Node ID
                1,
                // Order
                0x00, 0x02,
                // Placement
                3,
                // Name
                0x44, 0x75, 0x6D, 0x6D, 0x79, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                // Velocity
                0,  // DEFAULT
                // Node Type / Sub type
                0x01, 0x01,
                // Product Type
                0, 41,
                // Node Variation
                2,  // KIP
                // Power Mode
                0,
                // Serial number
                1, 2, 3, 4, 5, 6, 7, 8,
                // ???
                0,
                // State
                4,  // Executing
                // Current Position
                0xC0, 0x00,
                // Target
                0xC8, 0x00,
                // FP1 Current Position
                0xF7, 0xFF,
                // FP2 Current Position
                0xF7, 0xFF,
                // FP3 Current Position
                0xF7, 0xFF,
                // FP4 Current Position
                0xF7, 0xFF,
                // Remaining Time
                0, 5,
                // Time stamp
                0x00, 0xF9, 0x39, 0x90,
                // # of aliases
                1,
                // Aliases array
                0xD8, 0x03, 0xC4, 0x00,
                0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00
            ]);

            it("should create without error", function() {
                expect(() => new GW_GET_ALL_NODES_INFORMATION_NTF(data)).not.to.throw();
            });

            it("should return the node ID", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.NodeID).to.equal(1);
            });

            it("should return the order", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.Order).to.equal(2);
            });

            it("should return the placement", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.Placement).to.equal(3);
            });

            it("should return the name", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.Name).to.equal("Dummy");
            });

            it("should return the velocity", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.Velocity).to.equal(Velocity.Default);
            });

            it("should return the node type", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.ActuatorType).to.equal(ActuatorType.WindowOpener);
            });

            it("should return the node sub type", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.ActuatorSubType).to.equal(1);
            });

            it("should return the product type", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.ProductType).to.equal(41);
            });

            it("should return the node variation", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.NodeVariation).to.equal(NodeVariation.Kip);
            });

            it("should return the power mode", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.PowerSaveMode).to.equal(PowerSaveMode.AlwaysAlive);
            });

            it("should return the serial number", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.SerialNumber).to.equalBytes([1, 2, 3, 4, 5, 6, 7, 8]);
            });

            it("should return the state", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.OperatingState).to.equal(NodeOperatingState.Executing);
            });

            it("should return the current position", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.CurrentPosition).to.equal(0xC000);
            });

            it("should return the FP1 current position", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.FunctionalPosition1CurrentPosition).to.equal(0xF7FF);
            });

            it("should return the FP2 current position", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.FunctionalPosition2CurrentPosition).to.equal(0xF7FF);
            });

            it("should return the FP3 current position", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.FunctionalPosition3CurrentPosition).to.equal(0xF7FF);
            });

            it("should return the FP4 current position", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.FunctionalPosition4CurrentPosition).to.equal(0xF7FF);
            });

            it("should return the remaining time", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.RemainingTime).to.equal(5);
            });

            it("should return the time stamp", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.TimeStamp).to.deep.equal(new Date("1970-07-09T01:00:00.000Z"));
            });

            it("should return the aliases array", function() {
                const result = new GW_GET_ALL_NODES_INFORMATION_NTF(data);
                expect(result.ActuatorAliases).to.be.instanceOf(Array);
                expect(result.ActuatorAliases.length).to.equal(1);
                expect(result.ActuatorAliases[0]).to.deep.equal(new ActuatorAlias(0xD803, 0xC400));
            });
        });
    });
});