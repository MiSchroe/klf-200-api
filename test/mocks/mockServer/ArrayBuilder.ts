import { arrayToBitArray } from "../../../src/utils/BitArray";

export class ArrayBuilder {
	private readonly _internalArray: number[] = [];

	public toBuffer(): Buffer {
		return Buffer.from(this._internalArray);
	}

	public addBytes(...b: number[]): this {
		this._internalArray.push(...b);
		return this;
	}

	public addInts(...i: number[]): this {
		const buf = Buffer.alloc(2);
		for (const k of i) {
			buf.writeUInt16BE(k);
			this._internalArray.push(...buf);
		}
		return this;
	}

	public addLongs(...l: number[]): this {
		const buf = Buffer.alloc(4);
		for (const k of l) {
			buf.writeUInt32BE(k);
			this._internalArray.push(...buf);
		}
		return this;
	}

	public addString(s: string, len: number): this {
		const buf = Buffer.alloc(len);
		buf.write(s);
		this._internalArray.push(...buf);
		return this;
	}

	public fill(len: number, b?: number): this {
		const buf = Buffer.alloc(len, b);
		this._internalArray.push(...buf);
		return this;
	}

	public addBitArray(len: number, values: number[]): this {
		const buf = arrayToBitArray(values, len);
		this._internalArray.push(...buf);
		return this;
	}
}
