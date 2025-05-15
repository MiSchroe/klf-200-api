import { expect } from "chai";
import { TypedEvent } from "../../src/utils/TypedEvent";

describe("utils", () => {
	describe("TypedEvent", () => {
		let typedEvent: TypedEvent<string>;

		beforeEach(() => {
			typedEvent = new TypedEvent<string>();
		});

		it("should add a listener and emit an event", async () => {
			let eventReceived = false;
			const listener = (event: string): void => {
				eventReceived = event === "testEvent";
			};

			typedEvent.on(listener);
			await typedEvent.emit("testEvent");

			expect(eventReceived).to.be.true;
		});

		it("should add a once listener and emit an event", async () => {
			let eventReceived = false;
			const listener = (event: string): void => {
				eventReceived = event === "testEvent";
			};

			typedEvent.once(listener);
			await typedEvent.emit("testEvent");
			await typedEvent.emit("testEvent");

			expect(eventReceived).to.be.true;
		});

		it("should remove a listener", async () => {
			let eventReceived = false;
			const listener = (event: string): void => {
				eventReceived = event === "testEvent";
			};

			const disposable = typedEvent.on(listener);
			disposable[Symbol.dispose]();
			await typedEvent.emit("testEvent");

			expect(eventReceived).to.be.false;
		});

		it("should pipe events to another TypedEvent", async () => {
			const anotherTypedEvent = new TypedEvent<string>();
			let eventReceived = false;

			anotherTypedEvent.on((event: string) => {
				eventReceived = event === "testEvent";
			});

			typedEvent.pipe(anotherTypedEvent);
			await typedEvent.emit("testEvent");

			expect(eventReceived).to.be.true;
		});

		it("should remove all listeners", async () => {
			let eventReceived = false;
			const listener = (event: string) => {
				eventReceived = event === "testEvent";
			};

			typedEvent.on(listener);
			typedEvent.removeAllListeners();
			await typedEvent.emit("testEvent");

			expect(eventReceived).to.be.false;
		});
	});
});
