/// <reference path="../../types/chai-bytes/index.d.ts" />

'use strict';

import { GW_CS_DISCOVER_NODES_REQ, ActuatorType } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_CS_DISCOVER_NODES_REQ", function() {
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_CS_DISCOVER_NODES_REQ()).not.to.throw;
        });

        it("should write the node type at the right position", function() {
            const result = new GW_CS_DISCOVER_NODES_REQ(ActuatorType.Blind);
            expect(result).to.be.instanceOf(GW_CS_DISCOVER_NODES_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(3)).to.be.equal(ActuatorType.Blind);
        });

        it("should default to ActuatorType.NO_TYPE for node type", function() {
            const result = new GW_CS_DISCOVER_NODES_REQ();
            expect(result).to.be.instanceOf(GW_CS_DISCOVER_NODES_REQ).that.has.property("NodeType");
            const actuatorType = result.NodeType;
            expect(actuatorType).to.be.equal(ActuatorType.NO_TYPE);
        });
    });
});