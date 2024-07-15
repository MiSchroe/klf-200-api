"use strict";

/**
 * Converts a binary bit array to an array of numbers.
 *
 * @param {Buffer} bitArray Bytes where each bit is set for the corresponding number, e.g. the node ID.
 * @returns {number[]} Returns an array of numbers with an entry for each set bit.
 */
export function bitArrayToArray(bitArray: Buffer): number[] {
	const resultArray: number[] = [];
	for (let index = 0; index < bitArray.byteLength; index++) {
		let arrayByte = bitArray.readUInt8(index);

		// Skip bit operations if zero -> no bit is set
		if (arrayByte !== 0) {
			for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
				if ((arrayByte & 0x01) === 0x01) {
					resultArray.push(index * 8 + bitIndex);
				}
				arrayByte = arrayByte >>> 1;
			}
		}
	}

	return resultArray;
}

/**
 * Converts an array of numbers to a binary bit array.
 *
 * @param {number[]} numberArray Each number in the array corresponds to the bit that has to be set in the buffer.
 * @param {number} bufferLength Length of the resulting buffer. This value will be ignored, if a destination buffer is provided.
 * @param {Buffer} [destinationBuffer] Instead of creating a new buffer, the result can be written directly to an existing buffer.
 * @returns {Buffer} Returns a new buffer with the bit array or the destination buffer, if a value for the destination buffer is provided.
 */
export function arrayToBitArray(numberArray: number[], bufferLength: number, destinationBuffer?: Buffer): Buffer {
	const returnBuffer = destinationBuffer ? destinationBuffer : Buffer.alloc(bufferLength);
	if (destinationBuffer) {
		// Get the bufferLength from the destination buffer, if one is provided
		bufferLength = destinationBuffer.byteLength;
	}

	const maxAllowedNumber = bufferLength * 8 - 1; // Max. allowed number is defined by the buffer size
	// Fill buffer with zeros first
	returnBuffer.fill(0);

	// Write bits
	for (let index = 0; index < numberArray.length; index++) {
		// Check for valid number
		const numberToWrite = numberArray[index];
		if (numberToWrite < 0 || numberToWrite > maxAllowedNumber) throw new Error("Number out of range.");

		// Set bit
		returnBuffer[Math.floor(numberToWrite / 8)] |= 1 << numberToWrite % 8; // numberToWrite / 8 = byte position (0-bufferLength), numberToWrite % 8 = bit position (0-7)
	}

	return returnBuffer;
}
