export class Stack extends Array {
  // Ensure methods like map, filter return a Stack instead of Array
  static get [Symbol.species]() {
    return this;
  }

  // Peek: get the top element without removing it
  peek() {
    return this.length > 0 ? this[this.length - 1] : undefined;
  }

  // Check if stack is empty
  isEmpty() {
    return this.length === 0;
  }
}