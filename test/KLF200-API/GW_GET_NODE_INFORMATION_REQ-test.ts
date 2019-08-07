/// <reference path="../../types/chai-bytes/index.d.ts" />

'use strict';

import { GW_GET_NODE_INFORMATION_REQ } from "../../src";
import { expect, use } from "chai";
import 'mocha';
import chaibytes from "chai-bytes";
use(chaibytes);

describe("KLF200-API", function() {
    describe("GW_GET_NODE_INFORMATION_REQ", function() {
        const testNodeId = 42;
        it("shouldn't throw an error on create", function() {
            expect(() => new GW_GET_NODE_INFORMATION_REQ(testNodeId)).not.to.throw;
        });

        it("should write the correct node ID", function() {
            const result = new GW_GET_NODE_INFORMATION_REQ(testNodeId);
            expect(result).to.be.instanceOf(GW_GET_NODE_INFORMATION_REQ).that.has.property("Data");
            const buff = result.Data;
            expect(buff.readUInt8(3)).to.be.equal(testNodeId);
        });
    });
});