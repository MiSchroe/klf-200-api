"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TypedEvent_1 = require("./TypedEvent");
'use strict';
class Component {
    constructor() {
        /**
         * The event will be emitted when any of the public properties has changed.
         * The event object contains a reference to the product, the name of the property
         * that has changed and the new value of that property.
         *
         * @memberof Component
         */
        this.propertyChangedEvent = new TypedEvent_1.TypedEvent();
    }
    /**
     * This method emits the property changed event for the provided property name.
     *
     * @protected
     * @param {keyof Component} propertyName Name of the property that has changed.
     * @memberof Component
     */
    propertyChanged(propertyName) {
        this.propertyChangedEvent.emit({ o: this, propertyName: propertyName, propertyValue: this[propertyName] });
    }
}
exports.Component = Component;
