import { kruskal, prim, Edge, greedyAllocate, ClinicDemand } from '../../../src/lib/algorithms/community';

describe('Algorithms: Community Health Networks', () => {
    describe('kruskal', () => {
        it('should return the correct Minimum Spanning Tree', () => {
            const nodes = ['A', 'B', 'C', 'D'];
            const edges: Edge[] = [
                { u: 'A', v: 'B', weight: 1 },
                { u: 'B', v: 'C', weight: 2 },
                { u: 'A', v: 'C', weight: 3 },
                { u: 'C', v: 'D', weight: 1 }
            ];

            const mst = kruskal(nodes, edges);
            
            expect(mst).toHaveLength(3);
            
            const totalWeight = mst.reduce((sum, edge) => sum + edge.weight, 0);
            expect(totalWeight).toBe(4);
        });

        it('should use the cache on subsequent identical calls', () => {
             const nodes = ['X', 'Y'];
             const edges: Edge[] = [{ u: 'X', v: 'Y', weight: 5 }];

             const mst1 = kruskal(nodes, edges);
             const mst2 = kruskal(nodes, edges);

             expect(mst1).toEqual(mst2);
             expect(mst1).not.toBe(mst2); // Ensure it's a copy
        });
    });

    describe('prim', () => {
        it('should return empty array for empty graph', () => {
            expect(prim([], {})).toEqual([]);
        });

        it('should return MST correctly', () => {
            const nodes = ['A', 'B', 'C'];
            const adjMatrix = {
                'A': { 'B': 1, 'C': 4 },
                'B': { 'A': 1, 'C': 2 },
                'C': { 'A': 4, 'B': 2 }
            };
            const mst = prim(nodes, adjMatrix);
            expect(mst).toHaveLength(2);
            expect(mst).toContainEqual({ u: 'A', v: 'B', weight: 1 });
            expect(mst).toContainEqual({ u: 'B', v: 'C', weight: 2 });
        });
    });

    describe('greedyAllocate', () => {
        it('should allocate resources correctly based on priority', () => {
            const clinics: ClinicDemand[] = [
                { id: 'C1', demand: 50, priority: 5 },
                { id: 'C2', demand: 100, priority: 10 },
                { id: 'C3', demand: 20, priority: 2 }
            ];
            const totalStock = 120;

            const allocation = greedyAllocate(totalStock, clinics);

            expect(allocation['C2']).toBe(100); // Highest priority gets all demand
            expect(allocation['C1']).toBe(20);  // Second gets remainder
            expect(allocation['C3']).toBe(0);   // Last gets none
        });
    });
});
