import { TypedEvent } from "./TypedEvent";

("use strict");

export type PropertyChangedEvent = {
	o: object;
	propertyName: string;
	propertyValue: any;
};

export abstract class Component {
	/**
	 * The event will be emitted when any of the public properties has changed.
	 * The event object contains a reference to the product, the name of the property
	 * that has changed and the new value of that property.
	 *
	 * @memberof Component
	 */
	public readonly propertyChangedEvent = new TypedEvent<PropertyChangedEvent>();

	/**
	 * This method emits the property changed event for the provided property name.
	 *
	 * @protected
	 * @param {keyof Component} propertyName Name of the property that has changed.
	 * @memberof Component
	 */
	protected propertyChanged(propertyName: keyof this): void {
		this.propertyChangedEvent.emit({
			o: this,
			propertyName: <string>propertyName,
			propertyValue: this[propertyName],
		});
	}
}
