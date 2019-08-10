'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_GET_GROUP_INFORMATION_NTF, Velocity, NodeVariation, GroupType } from "../../src";

describe("KLF200-API", function() {
    describe("GW_GET_GROUP_INFORMATION_NTF", function() {
        describe("Constructor", function() {
            const data = Buffer.from([102, 0x02, 0x30, 
                // Group ID
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
                // Node Variation
                2,  // KIP
                // Group Type
                0,  // User Group
                // # of objects
                2,  // Two objects in group
                // Actuator bit array
                3, 0, 0, 0, 0, 
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                // Revision
                0x47, 0x11
            ]);

            it("should create without error", function() {
                expect(() => new GW_GET_GROUP_INFORMATION_NTF(data)).not.to.throw();
            });

            it("should return the group ID", function() {
                const result = new GW_GET_GROUP_INFORMATION_NTF(data);
                expect(result.GroupID).to.equal(1);
            });

            it("should return the order", function() {
                const result = new GW_GET_GROUP_INFORMATION_NTF(data);
                expect(result.Order).to.equal(2);
            });

            it("should return the placement", function() {
                const result = new GW_GET_GROUP_INFORMATION_NTF(data);
                expect(result.Placement).to.equal(3);
            });

            it("should return the name", function() {
                const result = new GW_GET_GROUP_INFORMATION_NTF(data);
                expect(result.Name).to.equal("Dummy");
            });

            it("should return the velocity", function() {
                const result = new GW_GET_GROUP_INFORMATION_NTF(data);
                expect(result.Velocity).to.equal(Velocity.Default);
            });

            it("should return the node variation", function() {
                const result = new GW_GET_GROUP_INFORMATION_NTF(data);
                expect(result.NodeVariation).to.equal(NodeVariation.Kip);
            });

            it("should return the group type", function() {
                const result = new GW_GET_GROUP_INFORMATION_NTF(data);
                expect(result.GroupType).to.equal(GroupType.UserGroup);
            });

            it("should return the nodes", function() {
                const result = new GW_GET_GROUP_INFORMATION_NTF(data);
                expect(result.Nodes).to.be.instanceOf(Array).and.have.members([0, 1]);
            });

            it("should return the empty nodes list if not User Group", function() {
                const data2 = new Buffer(data);
                // Change group type
                data2.writeUInt8(GroupType.House, 73);
                const result = new GW_GET_GROUP_INFORMATION_NTF(data2);
                expect(result.Nodes).to.be.instanceOf(Array).and.have.members([]);
            });

            it("should return the revision", function() {
                const result = new GW_GET_GROUP_INFORMATION_NTF(data);
                expect(result.Revision).to.equal(0x4711);
            });
        });
    });
});