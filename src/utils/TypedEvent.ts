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

/** passes through events as they happen. You will not get events from before you start listening */

/**
 * Event emitter class that handles typed events.
 *
 * @class TypedEvent<T>
 */
export class TypedEvent<T> implements Disposable {
	private listeners: Listener<T>[] = [];
	private listenersOncer: Listener<T>[] = [];

	public [Symbol.dispose](): void {
		debug(`TypedEvent disposed.`);
		this.listeners = [];
		this.listenersOncer = [];
	}

	/**
	 * Adds a listener function to an event emitter.
	 *
	 * @param listener Function that is called if the event is emitted.
	 * @returns {Disposable} Returns a disposable object that should be disposed when not needed anymore.
	 */
	public on(listener: Listener<T>): Disposable {
		debug(`TypedEvent on.`);
		this.listeners.push(listener);
		debug(`${this.listeners.length} listeners registered.`);
		return {
			[Symbol.dispose]: () => this.off(listener),
		};
	}

	/**
	 * Adds a listener function to an event emitter that is called only once.
	 *
	 * @param listener Function that is called only once if the event is emitted.
	 * @returns {void}
	 */
	public once(listener: Listener<T>): void {
		debug(`TypedEvent once.`);
		this.listenersOncer.push(listener);
		debug(`${this.listenersOncer.length} listeners registered.`);
	}

	/**
	 * Removes a listener function from an event emitter.
	 * If it is called from inside an event handler
	 * the current event will still call the removed handler
	 * if it wasn't called so far.
	 *
	 * @param listener Function that should be removed.
	 * @returns {void}
	 */
	public off(listener: Listener<T>): void {
		debug(`TypedEvent off.`);
		const callbackIndex = this.listeners.indexOf(listener);
		if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);
		debug(`${this.listeners.length} listeners registered.`);
	}

	/**
	 * Calls the registered event handler listener functions on after the other.
	 * The order in which the functions are called is not defined.
	 *
	 * @param {T} event The typed event parameter that will be provided to each listener.
	 * @returns {Promise<void>}
	 */
	public async emit(event: T): Promise<void> {
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
	}

	/**
	 * Pipes another event emitter to this event emitter.
	 *
	 * @param te Event emitter that is called after this event emitter.
	 * @returns {Disposable} Returns a disposable object that should be disposed when not needed anymore.
	 */
	public pipe(te: TypedEvent<T>): Disposable {
		debug(`TypedEvent pipe.`);
		return this.on(async (e) => await te.emit(e));
	}

	/**
	 * Removes all listeners from an event emitter.
	 *
	 * @returns {void}
	 */
	public removeAllListeners(): void {
		debug(`TypedEvent removeAllListeners.`);
		this.listeners = [];
		this.listenersOncer = [];
	}
}
