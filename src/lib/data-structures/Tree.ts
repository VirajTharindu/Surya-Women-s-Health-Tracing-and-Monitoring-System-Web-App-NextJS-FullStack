export class TreeNode<T> {
    data: T;
    children: TreeNode<T>[] = [];

    constructor(data: T) {
        this.data = data;
    }

    addChild(node: TreeNode<T>): void {
        this.children.push(node);
    }
}

export class HealthTree<T> {
    root: TreeNode<T>;

    constructor(rootData: T) {
        this.root = new TreeNode(rootData);
    }

    // Depth-First Search to find content
    findDFS(predicate: (data: T) => boolean, node: TreeNode<T> = this.root): TreeNode<T> | null {
        if (predicate(node.data)) return node;
        for (const child of node.children) {
            const found = this.findDFS(predicate, child);
            if (found) return found;
        }
        return null;
    }

    findAllDFS(predicate: (data: T) => boolean, node: TreeNode<T> = this.root, results: TreeNode<T>[] = []): TreeNode<T>[] {
        if (predicate(node.data)) results.push(node);
        for (const child of node.children) {
            this.findAllDFS(predicate, child, results);
        }
        return results;
    }

    // Breadth-First Search
    findBFS(predicate: (data: T) => boolean): TreeNode<T> | null {
        const queue: TreeNode<T>[] = [this.root];
        while (queue.length > 0) {
            const current = queue.shift()!;
            if (predicate(current.data)) return current;
            for (const child of current.children) {
                queue.push(child);
            }
        }
        return null;
    }

    findAllBFS(predicate: (data: T) => boolean): TreeNode<T>[] {
        const results: TreeNode<T>[] = [];
        const queue: TreeNode<T>[] = [this.root];
        while (queue.length > 0) {
            const current = queue.shift()!;
            if (predicate(current.data)) results.push(current);
            for (const child of current.children) {
                queue.push(child);
            }
        }
        return results;
    }
}
