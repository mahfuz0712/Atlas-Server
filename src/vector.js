// src/math/Vector.js

export  class Vector {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // Create from array: [1,2] or [1,2,3]
  static fromArray(arr) {
    return new Vector(...arr, 0).fixDimension();
  }

  // Ensure z exists for 2D vectors
  fixDimension() {
    if (this.z === undefined) this.z = 0;
    return this;
  }

  // Clone vector
  clone() {
    return new Vector(this.x, this.y, this.z);
  }

  // Add vectors
  add(v) {
    return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  // Subtract vectors
  subtract(v) {
    return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  // Multiply by scalar
  multiply(s) {
    return new Vector(this.x * s, this.y * s, this.z * s);
  }

  // Divide by scalar
  divide(s) {
    if (s === 0) throw new Error("Cannot divide by zero");
    return new Vector(this.x / s, this.y / s, this.z / s);
  }

  // Dot product
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  // Cross product (works only for 3D)
  cross(v) {
    return new Vector(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  // Magnitude (length)
  magnitude() {
    return Math.sqrt(this.x**2 + this.y**2 + this.z**2);
  }

  // Normalize → unit vector
  normalize() {
    const mag = this.magnitude();
    return mag === 0 ? new Vector(0, 0, 0) : this.divide(mag);
  }

  // Distance between two points (vectors)
  distance(v) {
    return this.subtract(v).magnitude();
  }

  // Angle between two vectors (in radians)
  angle(v) {
    const denom = this.magnitude() * v.magnitude();
    if (denom === 0) return 0;
    return Math.acos(this.dot(v) / denom);
  }

  // Projection of this vector on vector v
  projectOn(v) {
    const scalar = this.dot(v) / v.magnitude() ** 2;
    return v.multiply(scalar);
  }

  // Check equality of all components
  equals(v) {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }

  // Convert to array
  toArray() {
    return [this.x, this.y, this.z];
  }

  // Debug string
  toString() {
    return `(${this.x}, ${this.y}, ${this.z})`;
  }
}