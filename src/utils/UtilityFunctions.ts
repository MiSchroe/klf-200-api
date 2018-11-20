'use strict';

export function isArrayEqual<T>(first: Array<T>, second: Array<T>): boolean {
    if (first.length !== second.length) {
        return false;   // If length is different then the arrays can't be the same.
    }

    // Compare items
    for (const element of first) {
        if (second.indexOf(element) === -1) {
            return false;   // If element was not found in second array, the arrays aren't the same.
        }
    }

    // All items are contained in both arrays -> the are equal.
    return true;
}