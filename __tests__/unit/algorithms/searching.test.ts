import { binarySearch } from '../../../src/lib/algorithms/searching';

describe('Searching Algorithms', () => {
    describe('binarySearch', () => {
        const sortedData = [
            { id: 1, name: 'Alice' },
            { id: 3, name: 'Bob' },
            { id: 5, name: 'Charlie' },
            { id: 7, name: 'David' }
        ];

        it('should return the index of an existing element', () => {
            const index = binarySearch(sortedData, 5, (item) => item.id);
            expect(index).toBe(2);
        });

        it('should return -1 if element is not found', () => {
            const index = binarySearch(sortedData, 4, (item) => item.id);
            expect(index).toBe(-1);
        });

        it('should return -1 for an empty array', () => {
            const index = binarySearch([], 5, (item: any) => item.id);
            expect(index).toBe(-1);
        });
    });
});
