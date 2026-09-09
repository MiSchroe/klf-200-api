"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isArrayEqual } from "../../src/utils/UtilityFunctions";

describe("utils", function () {
	describe("UtilityFunctions", function () {
		describe("isArrayEqual", function () {
			it("should return false on arrays with different lengths", function () {
				const array1 = [1, 2, 3];
				const array2 = [1, 2, 3, 4];
				const result = isArrayEqual(array1, array2);
				assert.strictEqual(result, false);
			});

			it("should return true on the same arrays", function () {
				const array1 = [1, 2, 3];
				const result = isArrayEqual(array1, array1);
				assert.strictEqual(result, true);
			});

			it("should return true on same arrays with different order of items", function () {
				const array1 = [1, 2, 3];
				const array2 = [3, 1, 2];
				const result = isArrayEqual(array1, array2);
				assert.strictEqual(result, true);
			});

			it("should return false on different arrays with same lengths", function () {
				const array1 = [1, 2, 3];
				const array2 = [3, 1, 4];
				const result = isArrayEqual(array1, array2);
				assert.strictEqual(result, false);
			});
		});
	});
});
