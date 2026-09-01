/**
 * Binary Search - Fast lookup in sorted health records.
 * Time Complexity: O(log n)
 */
export function binarySearch<T>(
    arr: T[],
    target: any,
    getKey: (item: T) => any
): number {
    let low = 0;
    let high = arr.length - 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midVal = getKey(arr[mid]);

        if (midVal === target) {
            return mid;
        } else if (midVal < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    return -1; // Not found
}
