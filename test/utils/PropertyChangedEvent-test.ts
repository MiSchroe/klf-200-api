import { Component } from "../../src/utils/PropertyChangedEvent";
import { expect } from "chai";

"use strict";

class MockComponent extends Component {
    TestProperty: number = 42;
    TestPropertyChangedEvent() {
        this.propertyChanged("TestProperty");
    }
};

describe("utils", function() {
    describe("Component", function() {
        describe("propertyChanged", function() {
            it("should return emit a PropertyChangedEvent", function(done) {
                const test = new MockComponent();
                test.propertyChangedEvent.on((result) => {
                    try {
                        expect(result).to.have.property("o");
                        expect(result).to.have.property("propertyName", "TestProperty", "Property propertyName is missing or has wrong value.");
                        expect(result).to.have.property("propertyValue", 42, "Property propertyValue is missing or has wrong value.");
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
                // Invoke the test
                test.TestPropertyChangedEvent();
            });
        });
    });
});