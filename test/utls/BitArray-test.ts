import { expect, use } from "chai";
import { bitArrayToArray, arrayToBitArray } from "../../src/utils/BitArray";
import { chaiBytes } from "chai-bytes";

'use strict';

use(chaiBytes);

describe("utils", function() {
    describe("BitArray", function() {
        describe("bitArrayToArray", function() {
            it("should return an empty number array on a zero length buffer", function() {
                const buf = Buffer.alloc(0);
                const result = bitArrayToArray(buf);

                expect(result).to.be.an("array").that.is.empty;
            });

        });

        describe("arrayToBitArray", function() {
            it("should return an the correctly filled buffer", function() {
                const nums: number[] = [0, 2, 4, 6, 8, 10, 12, 14];
                const result = arrayToBitArray(nums, 2);

                expect(result).to.be.an.instanceof(Buffer);
                expect(result).to.be.equalBytes([0x55, 0x55]);
            });

        });
    });
});