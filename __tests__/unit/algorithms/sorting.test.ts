import { selectionSort, mergeSort, insertionSort } from '../../../src/lib/algorithms/sorting';

describe('Sorting Algorithms', () => {
    const compareNumbers = (a: number, b: number) => a - b;
    const compareObjects = (a: { val: number }, b: { val: number }) => a.val - b.val;

    describe('selectionSort', () => {
        it('should sort an array of numbers', () => {
            const arr = [5, 2, 9, 1, 5, 6];
            const sorted = selectionSort(arr, compareNumbers);
            expect(sorted).toEqual([1, 2, 5, 5, 6, 9]);
        });
    });

    describe('mergeSort', () => {
        it('should sort an array of objects', () => {
            const arr = [{ val: 5 }, { val: 1 }, { val: 3 }];
            const sorted = mergeSort(arr, compareObjects);
            expect(sorted).toEqual([{ val: 1 }, { val: 3 }, { val: 5 }]);
        });

        it('should handle empty array', () => {
            const sorted = mergeSort([], compareNumbers);
            expect(sorted).toEqual([]);
        });
    });

    describe('insertionSort', () => {
        it('should sort an array of numbers', () => {
            const arr = [4, 3, 2, 10, 12, 1, 5, 6];
            const sorted = insertionSort(arr, compareNumbers);
            expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 10, 12]);
        });
    });
});
