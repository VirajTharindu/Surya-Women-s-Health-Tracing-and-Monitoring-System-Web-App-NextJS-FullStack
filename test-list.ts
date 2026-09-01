import { DoublyLinkedList } from './src/lib/data-structures/DoublyLinkedList';

const list = new DoublyLinkedList<any>();
list.append({ date: '2024-08-28T00:00:00.000Z', type: 'cycle' });
list.append({ date: '2024-08-29T00:00:00.000Z', type: 'vital' });

console.log("Before sort:", list.toArray());

list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

console.log("After sort:", list.toArray());
