import { expect } from "chai";
import sinon from "sinon";
import { Component } from "../../src/utils/PropertyChangedEvent";

("use strict");

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
					expect(result).to.have.property("o");
					expect(result).to.have.property(
						"propertyName",
						"TestProperty",
						"Property propertyName is missing or has wrong value.",
					);
					expect(result).to.have.property(
						"propertyValue",
						42,
						"Property propertyValue is missing or has wrong value.",
					);
				});
				// Invoke the test
				await test.TestPropertyChangedEvent();
			});

			it("should return emit a PropertyChangedEvent only once", async function () {
				const test = new MockComponent();
				const eventHandlerSpyOn = sinon.spy();
				const eventHandlerSpyOnce = sinon.spy();
				test.propertyChangedEvent.on(eventHandlerSpyOn);
				test.propertyChangedEvent.once(eventHandlerSpyOnce);
				// Invoke the test twice
				await test.TestPropertyChangedEvent();
				await test.TestPropertyChangedEvent();
				expect(eventHandlerSpyOn).to.be.calledTwice;
				expect(eventHandlerSpyOnce).to.be.calledOnce;
			});
		});
	});
});
