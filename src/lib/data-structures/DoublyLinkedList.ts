import { mergeSort } from '../algorithms/sorting';

export class Node<T> {
    data: T;
    next: Node<T> | null = null;
    prev: Node<T> | null = null;

    constructor(data: T) {
        this.data = data;
    }
}

export class DoublyLinkedList<T> {
    head: Node<T> | null = null;
    tail: Node<T> | null = null;
    size: number = 0;

    append(data: T): void {
        const newNode = new Node(data);
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.prev = this.tail;
            if (this.tail) this.tail.next = newNode;
            this.tail = newNode;
        }
        this.size++;
    }

    // Find a node by a predicate
    find(predicate: (data: T) => boolean): Node<T> | null {
        let current = this.head;
        while (current) {
            if (predicate(current.data)) return current;
            current = current.next;
        }
        return null;
    }

    // Convert to array for rendering
    toArray(): T[] {
        const result: T[] = [];
        let current = this.head;
        while (current) {
            result.push(current.data);
            current = current.next;
        }
        return result;
    }

    // Clone list for state updates
    clone(): DoublyLinkedList<T> {
        const newList = new DoublyLinkedList<T>();
        let current = this.head;
        while (current) {
            newList.append(current.data);
            current = current.next;
        }
        return newList;
    }

    // Sort health logs based on date using custom Merge Sort
    sort(compare: (a: T, b: T) => number): void {
        const arr = this.toArray();
        const sortedArr = mergeSort(arr, compare);
        
        this.head = null;
        this.tail = null;
        this.size = 0;
        sortedArr.forEach(data => this.append(data));
    }
}
