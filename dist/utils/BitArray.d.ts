/**
 * Converts a binary bit array to an array of numbers.
 *
 * @export
 * @param {Buffer} bitArray Bytes where each bit is set for the corresponding number, e.g. the node ID.
 * @returns {number[]} Returns an array of numbers with an entry for each set bit.
 */
export declare function bitArrayToArray(bitArray: Buffer): number[];
/**
 * Converts an array of numbers to a binary bit array.
 *
 * @export
 * @param {number[]} numberArray Each number in the array corresponds to the bit that has to be set in the buffer.
 * @param {number} bufferLength Length of the resulting buffer. This value will be ignored, if a destination buffer is provided.
 * @param {Buffer} [destinationBuffer] Instead of creating a new buffer, the result can be written directly to an existing buffer.
 * @returns {Buffer} Returns a new buffer with the bit array or the destination buffer, if a value for the destination buffer is provided.
 */
export declare function arrayToBitArray(numberArray: number[], bufferLength: number, destinationBuffer?: Buffer): Buffer;
