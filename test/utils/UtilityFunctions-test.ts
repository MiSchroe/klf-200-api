import { isArrayEqual } from "../../src/utils/UtilityFunctions";
import { expect } from "chai";

"use strict";

describe("utils", function() {
    describe("UtilityFunctions", function() {
        describe("isArrayEqual", function() {
            it("should return false on arrays with different lengths", function() {
                const array1 = [1, 2, 3];
                const array2 = [1, 2, 3, 4];
                const result = isArrayEqual(array1, array2);
                expect(result).to.be.false;
            });

            it("should return true on the same arrays", function() {
                const array1 = [1, 2, 3];
                const result = isArrayEqual(array1, array1);
                expect(result).to.be.true;
            });

            it("should return true on same arrays with different order of items", function() {
                const array1 = [1, 2, 3];
                const array2 = [3, 1, 2];
                const result = isArrayEqual(array1, array2);
                expect(result).to.be.true;
            });

            it("should return false on different arrays with same lengths", function() {
                const array1 = [1, 2, 3];
                const array2 = [3, 1, 4];
                const result = isArrayEqual(array1, array2);
                expect(result).to.be.false;
            });
        });
    });
});