"use strict";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Component } from "../../src/utils/PropertyChangedEvent";

class MockComponent extends Component {
	TestProperty: number = 42;
	async TestPropertyChangedEvent(): Promise<void> {
		await this.propertyChanged("TestProperty");
	}
}

describe("utils", function () {
	describe("Component", function () {
		describe("propertyChanged", function () {
			it("should return emit a PropertyChangedEvent", async function () {
				const test = new MockComponent();
				test.propertyChangedEvent.on((result) => {
					assert.ok("o" in result);
					assert.strictEqual(
						result.propertyName,
						"TestProperty",
						"Property propertyName is missing or has wrong value.",
					);
					assert.strictEqual(
						result.propertyValue,
						42,
						"Property propertyValue is missing or has wrong value.",
					);
				});
				// Invoke the test
				await test.TestPropertyChangedEvent();
			});

			it("should return emit a PropertyChangedEvent only once", async function (t) {
				const test = new MockComponent();
				const eventHandlerSpyOn = t.mock.fn();
				const eventHandlerSpyOnce = t.mock.fn();
				test.propertyChangedEvent.on(eventHandlerSpyOn);
				test.propertyChangedEvent.once(eventHandlerSpyOnce);
				// Invoke the test twice
				await test.TestPropertyChangedEvent();
				await test.TestPropertyChangedEvent();
				assert.strictEqual(eventHandlerSpyOn.mock.callCount(), 2);
				assert.strictEqual(eventHandlerSpyOnce.mock.callCount(), 1);
			});
		});
	});
});
