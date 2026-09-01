export interface Prioritizable {
    priority: number; // e.g., timestamp
}

export class PriorityQueue<T extends Prioritizable> {
    private heap: T[] = [];

    push(item: T): void {
        this.heap.push(item);
        this.bubbleUp();
    }

    pop(): T | undefined {
        if (this.isEmpty()) return undefined;
        if (this.heap.length === 1) return this.heap.pop();

        const top = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.bubbleDown();
        return top;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    peek(): T | undefined {
        return this.heap[0];
    }

    private bubbleUp(): void {
        let index = this.heap.length - 1;
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].priority <= this.heap[index].priority) break;
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    private bubbleDown(): void {
        let index = 0;
        while (true) {
            let left = 2 * index + 1;
            let right = 2 * index + 2;
            let smallest = index;

            if (left < this.heap.length && this.heap[left].priority < this.heap[smallest].priority) {
                smallest = left;
            }
            if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) {
                smallest = right;
            }

            if (smallest === index) break;
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }

    toArray(): T[] {
        return [...this.heap].sort((a, b) => a.priority - b.priority);
    }

    clone(): PriorityQueue<T> {
        const newQueue = new PriorityQueue<T>();
        newQueue.heap = [...this.heap];
        return newQueue;
    }
}
