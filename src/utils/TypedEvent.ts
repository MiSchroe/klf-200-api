"use strict";

import debugModule from "debug";
import { dirname, parse } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const debug = debugModule(`klf-200-api:${parse(__filename).name}`);

/**
 * Generic typed interface for defining a typed listener function.
 *
 * @exports
 * @interface Listener<T>
 */
export interface Listener<T> {
	/**
	 * This function is called in case of an event.
	 * @param {T} event The typed event parameter.
	 * @returns {any} The returned value of the function will be ignored.
	 * @memberof Listener<T>
	 */
	(event: T): any;
}

/**
 * You should call the method dispose if you don't need the listener anymore.
 *
 * @exports
 * @interface Disposable
 */
export interface Disposable {
	/**
	 * When you call the dispose method the listener will be removed from the event emitter.
	 *
	 * @returns {void}
	 * @memberof Disposable
	 */
	dispose(): void;
}

/** passes through events as they happen. You will not get events from before you start listening */

/**
 * Event emitter class that handles typed events.
 *
 * @export
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
	 * @memberof TypedEvent<T>
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
	 * @memberof TypedEvent<T>
	 */
	once = (listener: Listener<T>): void => {
		debug(`TypedEvent once.`);
		this.listenersOncer.push(listener);
		debug(`${this.listenersOncer.length} listeners registered.`);
	};

	/**
	 * Removes a listener function from an event emitter.
	 *
	 * @param listener Function that should be removed.
	 * @returns {void}
	 * @memberof TypedEvent<T>
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
	 * @memberof TypedEvent<T>
	 */
	emit = async (event: T): Promise<void> => {
		debug(
			`TypedEvent emit. ${this.listeners.length} listeners and ${this.listenersOncer.length} once listeners to be called.`,
		);
		/** Update any general listeners */
		for (const listener of this.listeners) {
			debug(`Calling Listener ${listener.toString()}.`);
			await Promise.resolve(listener(event));
			debug(`Listener ${listener.toString()} called.`);
		}

		/** Clear the `once` queue */
		for (const listener of this.listenersOncer) {
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
	 * @memberof TypedEvent<T>
	 */
	pipe = (te: TypedEvent<T>): Disposable => {
		debug(`TypedEvent pipe.`);
		return this.on(async (e) => await te.emit(e));
	};
}
