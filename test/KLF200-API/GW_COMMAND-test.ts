"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LockTime, convertPosition, convertPositionRaw } from "../../src/KLF200-API/GW_COMMAND";
import { ActuatorType } from "../../src/KLF200-API/GW_SYSTEMTABLE_DATA";

describe("GW_COMMAND", function () {
	describe("LockTime", function () {
		describe("lockTimeValueToLockTime", function () {
			it("should return 30 for input value 0", function () {
				const inputValue = 0;
				const expectedValue = 30;
				const result = LockTime.lockTimeValueToLockTime(inputValue);

				assert.strictEqual(result, expectedValue);
			});

			it("should return 1290 for input value 42", function () {
				const inputValue = 42;
				const expectedValue = 1290;
				const result = LockTime.lockTimeValueToLockTime(inputValue);

				assert.strictEqual(result, expectedValue);
			});

			it("should return +infinity for input value 255", function () {
				const inputValue = 255;
				const expectedValue = Infinity;
				const result = LockTime.lockTimeValueToLockTime(inputValue);

				assert.strictEqual(result, expectedValue);
			});

			it("should throw on a negative input value", function () {
				const inputValue = -1;

				assert.throws(() => LockTime.lockTimeValueToLockTime(inputValue));
			});

			it("should throw on an input value greater than 255", function () {
				const inputValue = 256;

				assert.throws(() => LockTime.lockTimeValueToLockTime(inputValue));
			});
		});

		describe("lockTimeTolockTimeValue", function () {
			it("should return 0 for input value 30", function () {
				const inputValue = 30;
				const expectedValue = 0;
				const result = LockTime.lockTimeTolockTimeValue(inputValue);

				assert.strictEqual(result, expectedValue);
			});

			it("should return 42 for input value 1290", function () {
				const inputValue = 1290;
				const expectedValue = 42;
				const result = LockTime.lockTimeTolockTimeValue(inputValue);

				assert.strictEqual(result, expectedValue);
			});

			it("should return 255 for input value +infinity", function () {
				const inputValue = Infinity;
				const expectedValue = 255;
				const result = LockTime.lockTimeTolockTimeValue(inputValue);

				assert.strictEqual(result, expectedValue);
			});

			it("should throw on a negative input value", function () {
				const inputValue = -1;

				assert.throws(() => LockTime.lockTimeTolockTimeValue(inputValue));
			});

			it("should throw on an input value greater than 7560", function () {
				const inputValue = 7680;

				assert.throws(() => LockTime.lockTimeTolockTimeValue(inputValue));
			});

			it("should throw on an input value not dividable by 30", function () {
				const inputValue = 31;

				assert.throws(() => LockTime.lockTimeTolockTimeValue(inputValue));
			});
		});

		describe("lockTimeValueToLockTimeForLimitation", function () {
			it("should return 30 for input value 0", function () {
				const inputValue = 0;
				const expectedValue = 30;
				const result = LockTime.lockTimeValueToLockTimeForLimitation(inputValue);

				assert.strictEqual(result, expectedValue);
			});

			it("should return 1290 for input value 42", function () {
				const inputValue = 42;
				const expectedValue = 1290;
				const result = LockTime.lockTimeValueToLockTimeForLimitation(inputValue);

				assert.strictEqual(result, expectedValue);
			});

			it("should return +infinity for input value 253", function () {
				const inputValue = 253;
				const expectedValue = Infinity;
				const result = LockTime.lockTimeValueToLockTimeForLimitation(inputValue);

				assert.strictEqual(result, expectedValue);
			});

			it("should throw on a negative input value", function () {
				const inputValue = -1;

				assert.throws(() => LockTime.lockTimeValueToLockTimeForLimitation(inputValue));
			});

			it("should throw on an input value greater than 255", function () {
				const inputValue = 256;

				assert.throws(() => LockTime.lockTimeValueToLockTimeForLimitation(inputValue));
			});

			it("should return undefined for an input value greater than 253", function () {
				const inputValue = 254;
				const result = LockTime.lockTimeValueToLockTimeForLimitation(inputValue);

				assert.strictEqual(result, undefined);
			});
		});

		describe("lockTimeTolockTimeValueForLimitation", function () {
			it("should return 0 for input value 30", function () {
				const inputValue = 30;
				const expectedValue = 0;
				const result = LockTime.lockTimeTolockTimeValueForLimitation(inputValue);

				assert.strictEqual(result, expectedValue);
			});

			it("should return 42 for input value 1290", function () {
				const inputValue = 1290;
				const expectedValue = 42;
				const result = LockTime.lockTimeTolockTimeValueForLimitation(inputValue);

				assert.strictEqual(result, expectedValue);
			});

			it("should return 253 for input value +infinity", function () {
				const inputValue = Infinity;
				const expectedValue = 253;
				const result = LockTime.lockTimeTolockTimeValueForLimitation(inputValue);

				assert.strictEqual(result, expectedValue);
			});

			it("should throw on a negative input value", function () {
				const inputValue = -1;

				assert.throws(() => LockTime.lockTimeTolockTimeValueForLimitation(inputValue));
			});

			it("should throw on an input value greater than 7560", function () {
				const inputValue = 7620;

				assert.throws(() => LockTime.lockTimeTolockTimeValueForLimitation(inputValue));
			});

			it("should throw on an input value not dividable by 30", function () {
				const inputValue = 31;

				assert.throws(() => LockTime.lockTimeTolockTimeValueForLimitation(inputValue));
			});
		});
	});

	describe("convertPositionRaw", function () {
		it("should return 0 for 0x0000 for a roller shutter", function () {
			const inputValue = 0x0000;
			const expectedValue = 0;
			const actuatorType = ActuatorType.RollerShutter;
			const result = convertPositionRaw(inputValue, actuatorType);

			assert.strictEqual(result, expectedValue);
		});

		it("should return 1 for 0xC800 for a roller shutter", function () {
			const inputValue = 0xc800;
			const expectedValue = 1;
			const actuatorType = ActuatorType.RollerShutter;
			const result = convertPositionRaw(inputValue, actuatorType);

			assert.strictEqual(result, expectedValue);
		});

		it("should return 0.1 for 0x1400 for a roller shutter", function () {
			const inputValue = 0x1400;
			const expectedValue = 0.1;
			const actuatorType = ActuatorType.RollerShutter;
			const result = convertPositionRaw(inputValue, actuatorType);

			assert.strictEqual(result, expectedValue);
		});

		it("should return NaN for a value greater than 0xC800 for a roller shutter", function () {
			const inputValue = 0xc801;
			const actuatorType = ActuatorType.RollerShutter;
			const result = convertPositionRaw(inputValue, actuatorType);

			assert.ok(Number.isNaN(result));
		});

		it("should return 1 for 0x0000 for a window opener", function () {
			const inputValue = 0x0000;
			const expectedValue = 1;
			const actuatorType = ActuatorType.WindowOpener;
			const result = convertPositionRaw(inputValue, actuatorType);

			assert.strictEqual(result, expectedValue);
		});

		it("should return 0 for 0xC800 for a window opener", function () {
			const inputValue = 0xc800;
			const expectedValue = 0;
			const actuatorType = ActuatorType.WindowOpener;
			const result = convertPositionRaw(inputValue, actuatorType);

			assert.strictEqual(result, expectedValue);
		});

		it("should return 0.9 for 0x1400 for a window opener", function () {
			const inputValue = 0x1400;
			const expectedValue = 0.9;
			const actuatorType = ActuatorType.WindowOpener;
			const result = convertPositionRaw(inputValue, actuatorType);

			assert.strictEqual(result, expectedValue);
		});

		it("should return NaN for a value greater than 0xC800 for a window opener", function () {
			const inputValue = 0xc801;
			const actuatorType = ActuatorType.WindowOpener;
			const result = convertPositionRaw(inputValue, actuatorType);

			assert.ok(Number.isNaN(result));
		});
	});

	describe("convertPosition", function () {
		it("should return 0x0000 for 0 for a roller shutter", function () {
			const inputValue = 0;
			const expectedValue = 0x0000;
			const actuatorType = ActuatorType.RollerShutter;
			const result = convertPosition(inputValue, actuatorType);

			assert.strictEqual(result, expectedValue);
		});

		it("should return 0xC800 for 1 for a roller shutter", function () {
			const inputValue = 1;
			const expectedValue = 0xc800;
			const actuatorType = ActuatorType.RollerShutter;
			const result = convertPosition(inputValue, actuatorType);

			assert.strictEqual(result, expectedValue);
		});

		it("should return 0x1400 for 0.1 for a roller shutter", function () {
			const inputValue = 0.1;
			const expectedValue = 0x1400;
			const actuatorType = ActuatorType.RollerShutter;
			const result = convertPosition(inputValue, actuatorType);

			assert.strictEqual(result, expectedValue);
		});

		it("should throw an error for negative values for a roller shutter", function () {
			const inputValue = -0.1;
			const actuatorType = ActuatorType.RollerShutter;

			assert.throws(() => convertPosition(inputValue, actuatorType));
		});

		it("should throw an error for values larger than 1.0 for a roller shutter", function () {
			const inputValue = 1.1;
			const actuatorType = ActuatorType.RollerShutter;

			assert.throws(() => convertPosition(inputValue, actuatorType));
		});

		it("should return 0x0000 for 1 for a window opener", function () {
			const inputValue = 1;
			const expectedValue = 0x0000;
			const actuatorType = ActuatorType.WindowOpener;
			const result = convertPosition(inputValue, actuatorType);

			assert.strictEqual(result, expectedValue);
		});

		it("should return 0xC800 for 0 for a window opener", function () {
			const inputValue = 0;
			const expectedValue = 0xc800;
			const actuatorType = ActuatorType.WindowOpener;
			const result = convertPosition(inputValue, actuatorType);

			assert.strictEqual(result, expectedValue);
		});

		it("should return 0x1400 for 0.9 for a window opener", function () {
			const inputValue = 0.9;
			const expectedValue = 0x1400;
			const actuatorType = ActuatorType.WindowOpener;
			const result = convertPosition(inputValue, actuatorType);

			assert.strictEqual(result, expectedValue);
		});

		it("should throw an error for negative values for a window opener", function () {
			const inputValue = -0.1;
			const actuatorType = ActuatorType.WindowOpener;

			assert.throws(() => convertPosition(inputValue, actuatorType));
		});

		it("should throw an error for values larger than 1.0 for a window opener", function () {
			const inputValue = 1.1;
			const actuatorType = ActuatorType.WindowOpener;

			assert.throws(() => convertPosition(inputValue, actuatorType));
		});
	});
});
