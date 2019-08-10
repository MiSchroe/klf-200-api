'use strict';

import { expect } from "chai";
import 'mocha';
import { GW_NODE_INFORMATION_CHANGED_NTF, NodeVariation } from "../../src";

describe("KLF200-API", function() {
    describe("GW_NODE_INFORMATION_CHANGED_NTF", function() {
        describe("Constructor", function() {
            const data = Buffer.from([72, 0x02, 0x0C, 
                // Node ID
                1,
                // Name
                0x44, 0x75, 0x6D, 0x6D, 0x79, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                // Order
                0x00, 0x02,
                // Placement
                3,
                // Node Variation
                2  // KIP
            ]);

            it("should create without error", function() {
                expect(() => new GW_NODE_INFORMATION_CHANGED_NTF(data)).not.to.throw();
            });

            it("should return the node ID", function() {
                const result = new GW_NODE_INFORMATION_CHANGED_NTF(data);
                expect(result.NodeID).to.equal(1);
            });

            it("should return the order", function() {
                const result = new GW_NODE_INFORMATION_CHANGED_NTF(data);
                expect(result.Order).to.equal(2);
            });

            it("should return the placement", function() {
                const result = new GW_NODE_INFORMATION_CHANGED_NTF(data);
                expect(result.Placement).to.equal(3);
            });

            it("should return the name", function() {
                const result = new GW_NODE_INFORMATION_CHANGED_NTF(data);
                expect(result.Name).to.equal("Dummy");
            });

            it("should return the node variation", function() {
                const result = new GW_NODE_INFORMATION_CHANGED_NTF(data);
                expect(result.NodeVariation).to.equal(NodeVariation.Kip);
            });
        });
    });
});