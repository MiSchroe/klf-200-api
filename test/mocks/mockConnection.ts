"use strict";

import {
	GW_ERROR_NTF,
	GW_FRAME_CFM,
	GatewayCommand,
	IConnection,
	IGW_FRAME_NTF,
	IGW_FRAME_RCV,
	IGW_FRAME_REQ,
	KLF200SocketProtocol,
} from "../../src";

import { Disposable, Listener, TypedEvent } from "../../src/utils/TypedEvent";

export class MockExceptionConnection implements IConnection {
	async loginAsync(_password: string, _timeout?: number): Promise<void> {
		throw new Error("Method not implemented.");
	}

	async logoutAsync(_timeout?: number): Promise<void> {
		throw new Error("Method not implemented.");
	}

	async sendFrameAsync(_frame: IGW_FRAME_REQ, _timeout?: number): Promise<IGW_FRAME_RCV> {
		return Promise.reject(new Error("Test Exception"));
	}

	on(_handler: Listener<IGW_FRAME_RCV>, _filter?: GatewayCommand[]): Disposable {
		throw new Error("Method not implemented.");
	}

	onFrameSent(_handler: Listener<IGW_FRAME_REQ>, _filter?: GatewayCommand[]): Disposable {
		throw new Error("Method not implemented.");
	}

	KLF200SocketProtocol?: KLF200SocketProtocol;
}

export class MockConnection extends MockExceptionConnection {
	private _valueToReturn: IGW_FRAME_RCV[] = [];
	public get valueToReturn(): IGW_FRAME_RCV[] {
		return this._valueToReturn;
	}

	constructor(valueToReturn: IGW_FRAME_RCV | IGW_FRAME_RCV[]) {
		super();
		this.setValueToReturn(valueToReturn);
	}

	private setValueToReturn(newValue: IGW_FRAME_RCV | IGW_FRAME_RCV[]): void {
		if (Array.isArray(newValue)) {
			this._valueToReturn = [...newValue];
		} else {
			// Wrap a single return value into an array to make things easier in sendFrameAsync
			this._valueToReturn = [newValue];
		}
	}

	async sendFrameAsync(_frame: IGW_FRAME_REQ, _timeout?: number): Promise<IGW_FRAME_RCV> {
		// Loop through the frames until an error frame or an confirmation frame.
		// All frames will be emitted to notification handlers, if any.
		// We will reject with an error, if no more frames are available.
		while (true) {
			if (this._valueToReturn.length == 0) {
				return Promise.reject(new Error("No more test frames."));
			}

			const nextFrame = this._valueToReturn.shift() as IGW_FRAME_RCV;
			if (nextFrame instanceof GW_ERROR_NTF) {
				// Reject on error frame
				return Promise.reject(new Error(nextFrame.getError()));
			} else {
				this._onHandler.emit(nextFrame);
				if (nextFrame instanceof GW_FRAME_CFM) {
					return Promise.resolve(nextFrame);
				}
			}
		}
	}

	async sendNotification(
		notificationFrame: IGW_FRAME_NTF,
		responseFrames: IGW_FRAME_RCV | IGW_FRAME_RCV[],
	): Promise<void> {
		this.setValueToReturn(responseFrames);
		await this._onHandler.emit(notificationFrame);
	}

	private _onHandler = new TypedEvent<IGW_FRAME_RCV>();
	on(handler: Listener<IGW_FRAME_RCV>, filter?: GatewayCommand[]): Disposable {
		if (typeof filter === "undefined") {
			return this._onHandler.on(handler);
		} else {
			return this._onHandler.on(async (frame) => {
				if (filter.indexOf(frame.Command) >= 0) {
					await Promise.resolve(handler(frame));
				}
			});
		}
	}
}
