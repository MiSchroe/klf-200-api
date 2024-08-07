"use strict";

import debugModule from "debug";

const debug = debugModule(`klf-200-api:TypedEvents`);

/**
 * Generic typed interface for defining a typed listener function.
 *
 * @interface Listener<T>
 */
export interface Listener<T> {
	/**
	 * This function is called in case of an event.
	 * @param {T} event The typed event parameter.
	 * @returns {any} The returned value of the function will be ignored.
	 */
	(event: T): any;
}

/**
 * You should call the method dispose if you don't need the listener anymore.
 *
 * @interface Disposable
 */
export interface Disposable {
	/**
	 * When you call the dispose method the listener will be removed from the event emitter.
	 *
	 * @returns {void}
	 */
	dispose(): void;
}

/** passes through events as they happen. You will not get events from before you start listening */

/**
 * Event emitter class that handles typed events.
 *
 * @class TypedEvent<T>
 */
export class TypedEvent<T> {
	private listeners: Listener<T>[] = [];
	private listenersOncer: Listener<T>[] = [];

	/**
	 * Adds a listener function to an event emitter.
	 *
	 * @param listener Function that is called if the event is emitted.
	 * @returns {Disposable} Returns a disposable object that should be disposed when not needed anymore.
	 */
	on = (listener: Listener<T>): Disposable => {
		debug(`TypedEvent on.`);
		this.listeners.push(listener);
		debug(`${this.listeners.length} listeners registered.`);
		return {
			dispose: () => this.off(listener),
		};
	};

	/**
	 * Adds a listener function to an event emitter that is called only once.
	 *
	 * @param listener Function that is called only once if the event is emitted.
	 * @returns {void}
	 */
	once = (listener: Listener<T>): void => {
		debug(`TypedEvent once.`);
		this.listenersOncer.push(listener);
		debug(`${this.listenersOncer.length} listeners registered.`);
	};

	/**
	 * Removes a listener function from an event emitter.
	 * If it is called from inside an event handler
	 * the current event will still call the removed handler
	 * if it wasn't called so far.
	 *
	 * @param listener Function that should be removed.
	 * @returns {void}
	 */
	off = (listener: Listener<T>): void => {
		debug(`TypedEvent off.`);
		const callbackIndex = this.listeners.indexOf(listener);
		if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);
		debug(`${this.listeners.length} listeners registered.`);
	};

	/**
	 * Calls the registered event handler listener functions on after the other.
	 * The order in which the functions are called is not defined.
	 *
	 * @param {T} event The typed event parameter that will be provided to each listener.
	 * @returns {Promise<void>}
	 */
	emit = async (event: T): Promise<void> => {
		debug(
			`TypedEvent emit. ${this.listeners.length} listeners and ${this.listenersOncer.length} once listeners to be called.`,
		);
		// Copy all listeners to a temporary array
		// in case that an event listener would
		// remove itself from the list.
		const temporaryListeners = this.listeners.slice();

		/** Update any general listeners */
		for (const listener of temporaryListeners) {
			debug(`Calling Listener ${listener.toString()}.`);
			await Promise.resolve(listener(event));
			debug(`Listener ${listener.toString()} called.`);
		}

		// Copy all listeners to a temporary array
		// in case that an event listener would
		// remove itself from the list.
		const temporaryListenersOnce = this.listenersOncer.slice();

		/** Clear the `once` queue */
		for (const listener of temporaryListenersOnce) {
			debug(`Calling Listener Once ${listener.toString()}.`);
			await Promise.resolve(listener(event));
			debug(`Listener Once ${listener.toString()} called.`);
		}
		this.listenersOncer = [];
	};

	/**
	 * Pipes another event emitter to this event emitter.
	 *
	 * @param te Event emitter that is called after this event emitter.
	 * @returns {Disposable} Returns a disposable object that should be disposed when not needed anymore.
	 */
	pipe = (te: TypedEvent<T>): Disposable => {
		debug(`TypedEvent pipe.`);
		return this.on(async (e) => await te.emit(e));
	};
}
