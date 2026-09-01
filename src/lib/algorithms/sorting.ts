/**
 * Selection Sort - Good for small arrays or demonstrating simple sorting.
 * Time Complexity: O(n^2)
 */
export function selectionSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (compare(arr[j], arr[minIdx]) < 0) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        }
    }
    return arr;
}

/**
 * Merge Sort - Efficient for larger health datasets.
 * Time Complexity: O(n log n)
 */
export function mergeSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
    if (arr.length <= 1) return arr;

    const middle = Math.floor(arr.length / 2);
    const left = arr.slice(0, middle);
    const right = arr.slice(middle);

    return merge(
        mergeSort(left, compare),
        mergeSort(right, compare),
        compare
    );
}

function merge<T>(left: T[], right: T[], compare: (a: T, b: T) => number): T[] {
    let result: T[] = [];
    let leftIdx = 0;
    let rightIdx = 0;

    while (leftIdx < left.length && rightIdx < right.length) {
        if (compare(left[leftIdx], right[rightIdx]) < 0) {
            result.push(left[leftIdx]);
            leftIdx++;
        } else {
            result.push(right[rightIdx]);
            rightIdx++;
        }
    }

    return result.concat(left.slice(leftIdx)).concat(right.slice(rightIdx));
}

/**
 * Insertion Sort - Efficient for small datasets or nearly sorted health logs.
 * Time Complexity: O(n^2)
 */
export function insertionSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
    const n = arr.length;
    for (let i = 1; i < n; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= 0 && compare(arr[j], key) > 0) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
    return arr;
}
