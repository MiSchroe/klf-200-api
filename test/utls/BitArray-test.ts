import { expect } from "chai";
import { bitArrayToArray } from "../../src/utils/BitArray";

'use strict';

describe("utils", function() {
    describe("BitArray", function() {
        describe("bitArrayToArray", function() {
            it("should return an empty number array on a zero length buffer", function() {
                const buf = Buffer.alloc(0);
                const result = bitArrayToArray(buf);

                expect(result).to.be.an("array").that.is.empty;
            });
        });

        // describe("arrayToBitArray", function() {

        // });
    });
});