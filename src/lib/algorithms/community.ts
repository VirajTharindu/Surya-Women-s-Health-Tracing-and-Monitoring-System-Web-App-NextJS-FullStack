/**
 * Graph Algorithms for Community Health Networks
 */

export interface Edge {
    u: string;
    v: string;
    weight: number;
}

/**
 * Kruskal's Algorithm - Minimum Spanning Tree (MST) for clinic connectivity.
 * Used for optimizing mobile midwife routes.
 */
const kruskalCache = new Map<string, Edge[]>();
export function kruskal(nodes: string[], edges: Edge[]): Edge[] {
    // Generate a deterministic cache key based on nodes and edges
    const key = JSON.stringify({
        nodes: nodes.slice().sort(),
        edges: edges.map(e => ({ u: e.u, v: e.v, weight: e.weight })).sort((a, b) => {
            if (a.u !== b.u) return a.u < b.u ? -1 : 1;
            if (a.v !== b.v) return a.v < b.v ? -1 : 1;
            return a.weight - b.weight;
        })
    });
    if (kruskalCache.has(key)) {
        // Return a shallow copy to prevent external mutation
        return kruskalCache.get(key)!.slice();
    }
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    const parent: Record<string, string> = {};
    nodes.forEach(node => { parent[node] = node; });
    const find = (i: string): string => {
        if (parent[i] === i) return i;
        return find(parent[i]);
    };
    const union = (root1: string, root2: string) => {
        parent[root1] = root2;
    };
    const mst: Edge[] = [];
    for (const edge of sortedEdges) {
        const rootU = find(edge.u);
        const rootV = find(edge.v);
        if (rootU !== rootV) {
            mst.push(edge);
            union(rootU, rootV);
        }
    }
    kruskalCache.set(key, mst.slice());
    return mst;
}

/**
 * Prim's Algorithm - Another MST approach.
 */
export function prim(nodes: string[], adjMatrix: Record<string, Record<string, number>>): Edge[] {
    const mst: Edge[] = [];
    const visited = new Set<string>();
    const startNode = nodes[0];

    if (!startNode) return [];
    visited.add(startNode);

    while (visited.size < nodes.length) {
        let minEdge: Edge | null = null;
        let minWeight = Infinity;

        for (const u of visited) {
            for (const v of nodes) {
                if (!visited.has(v) && adjMatrix[u]?.[v] < minWeight) {
                    minWeight = adjMatrix[u][v];
                    minEdge = { u, v, weight: minWeight };
                }
            }
        }

        if (minEdge) {
            mst.push(minEdge);
            visited.add(minEdge.v);
        } else {
            break;
        }
    }

    return mst;
}

/**
 * Greedy Algorithm - Medication Allocation
 * Allocates limited resources (e.g., Iron tablets) to clinics with highest priority.
 */
export interface ClinicDemand {
    id: string;
    demand: number;
    priority: number; // 1-10 (high is critical)
}

export function greedyAllocate(totalStock: number, clinics: ClinicDemand[]): Record<string, number> {
    // Sort clinics by priority descending
    const sortedClinics = [...clinics].sort((a, b) => b.priority - a.priority);
    const allocation: Record<string, number> = {};
    let remainingStock = totalStock;

    for (const clinic of sortedClinics) {
        const count = Math.min(remainingStock, clinic.demand);
        allocation[clinic.id] = count;
        remainingStock -= count;
    }

    return allocation;
}
