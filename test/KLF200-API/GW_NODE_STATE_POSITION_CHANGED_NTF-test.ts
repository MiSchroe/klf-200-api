'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_NODE_STATE_POSITION_CHANGED_NTF, NodeOperatingState } from "../../src";

describe("KLF200-API", function() {
    describe("GW_NODE_STATE_POSITION_CHANGED_NTF", function() {
        describe("Constructor", function() {
            const data = Buffer.from([23, 0x02, 0x11, 
                // Node ID
                1,
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
                0x00, 0xF9, 0x39, 0x90
            ]);

            it("should create without error", function() {
                expect(() => new GW_NODE_STATE_POSITION_CHANGED_NTF(data)).not.to.throw();
            });

            it("should return the node ID", function() {
                const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
                expect(result.NodeID).to.equal(1);
            });

            it("should return the state", function() {
                const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
                expect(result.OperatingState).to.equal(NodeOperatingState.Executing);
            });

            it("should return the current position", function() {
                const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
                expect(result.CurrentPosition).to.equal(0xC000);
            });

            it("should return the FP1 current position", function() {
                const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
                expect(result.FunctionalPosition1CurrentPosition).to.equal(0xF7FF);
            });

            it("should return the FP2 current position", function() {
                const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
                expect(result.FunctionalPosition2CurrentPosition).to.equal(0xF7FF);
            });

            it("should return the FP3 current position", function() {
                const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
                expect(result.FunctionalPosition3CurrentPosition).to.equal(0xF7FF);
            });

            it("should return the FP4 current position", function() {
                const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
                expect(result.FunctionalPosition4CurrentPosition).to.equal(0xF7FF);
            });

            it("should return the remaining time", function() {
                const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
                expect(result.RemainingTime).to.equal(5);
            });

            it("should return the time stamp", function() {
                const result = new GW_NODE_STATE_POSITION_CHANGED_NTF(data);
                expect(result.TimeStamp).to.deep.equal(new Date("1970-07-09T01:00:00.000Z"));
            });
        });
    });
});