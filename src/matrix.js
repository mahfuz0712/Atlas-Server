// matrix.js
// Full Matrix class with hybrid numeric support (Number, BigInt, Complex)
// Complex numbers are objects: { re: <Number>, im: <Number> }
// Usage: import { Matrix } from './matrix.js'

/**
 * Numeric helpers & type detection
 *
 * Type precedence (for auto-detect):
 *  - If any element is Complex -> treat matrix as COMPLEX
 *  - Else if any element is BigInt -> treat matrix as BIGINT
 *  - Else -> NUMBER
 *
 * Limitations:
 *  - BigInt: addition/subtraction/multiplication fully supported.
 *    Division (needed for inverse/determinant) is only allowed when
 *    exact integer division occurs during elimination; otherwise those
 *    operations will throw. Inverse for BigInt matrices is not generally supported.
 *  - Mixed BigInt + Number: BigInt presence forces BIGINT mode; Number values
 *    are converted to BigInt (via BigInt(value)) — this may lose fractional parts.
 *  - Complex: supports arithmetic fully using Number floats.
 */

function isComplex(val) {
  return val && typeof val === "object" && "re" in val && "im" in val;
}

function isBigInt(val) {
  return typeof val === "bigint";
}

function isNumber(val) {
  return typeof val === "number" && Number.isFinite(val);
}

function cloneValue(v) {
  if (isComplex(v)) return { re: v.re, im: v.im };
  if (isBigInt(v)) return BigInt(v);
  return v;
}

function complex(re, im = 0) {
  return { re, im };
}

function complexAdd(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}

function complexSub(a, b) {
  return { re: a.re - b.re, im: a.im - b.im };
}

function complexMul(a, b) {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

function complexDiv(a, b) {
  const denom = b.re * b.re + b.im * b.im;
  if (denom === 0) throw new Error("Division by zero (complex)");
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
}

function complexEq(a, b, tol = 1e-9) {
  return Math.abs(a.re - b.re) < tol && Math.abs(a.im - b.im) < tol;
}

function numberEq(a, b, tol = 1e-9) {
  return Math.abs(a - b) < tol;
}

function bigintEq(a, b) {
  return a === b;
}

// Arithmetic dispatchers based on active numeric mode
const NumericMode = {
  NUMBER: "number",
  BIGINT: "bigint",
  COMPLEX: "complex",
};

class NumOps {
  constructor(mode) {
    this.mode = mode;
  }

  zero() {
    if (this.mode === NumericMode.COMPLEX) return complex(0, 0);
    if (this.mode === NumericMode.BIGINT) return 0n;
    return 0;
  }

  one() {
    if (this.mode === NumericMode.COMPLEX) return complex(1, 0);
    if (this.mode === NumericMode.BIGINT) return 1n;
    return 1;
  }

  add(a, b) {
    if (this.mode === NumericMode.COMPLEX) return complexAdd(a, b);
    if (this.mode === NumericMode.BIGINT) return a + b;
    return a + b;
  }

  sub(a, b) {
    if (this.mode === NumericMode.COMPLEX) return complexSub(a, b);
    if (this.mode === NumericMode.BIGINT) return a - b;
    return a - b;
  }

  mul(a, b) {
    if (this.mode === NumericMode.COMPLEX) return complexMul(a, b);
    if (this.mode === NumericMode.BIGINT) return a * b;
    return a * b;
  }

  // Division: for BigInt, we only allow exact division (a % b === 0n)
  div(a, b) {
    if (this.mode === NumericMode.COMPLEX) return complexDiv(a, b);
    if (this.mode === NumericMode.BIGINT) {
      if (b === 0n) throw new Error("Division by zero (BigInt)");
      if (a % b !== 0n) {
        throw new Error("Non-exact division encountered with BigInt mode");
      }
      return a / b;
    }
    if (b === 0) throw new Error("Division by zero (Number)");
    return a / b;
  }

  eq(a, b, tol = 1e-9) {
    if (this.mode === NumericMode.COMPLEX) return complexEq(a, b, tol);
    if (this.mode === NumericMode.BIGINT) return bigintEq(a, b);
    return numberEq(a, b, tol);
  }

  isZero(a, tol = 1e-9) {
    if (this.mode === NumericMode.COMPLEX) {
      return Math.abs(a.re) < tol && Math.abs(a.im) < tol;
    }
    if (this.mode === NumericMode.BIGINT) return a === 0n;
    return Math.abs(a) < tol;
  }

  conjugate(a) {
    if (this.mode === NumericMode.COMPLEX) return { re: a.re, im: -a.im };
    if (this.mode === NumericMode.BIGINT) return a;
    return a;
  }

  toDisplay(a) {
    if (this.mode === NumericMode.COMPLEX)
      return `${a.re}${a.im >= 0 ? "+" : ""}${a.im}i`;
    return String(a);
  }
}

/* ---------------- Matrix class ---------------- */

export class Matrix {
  constructor(rows, cols, fill = 0) {
    if (
      !Number.isInteger(rows) ||
      rows <= 0 ||
      !Number.isInteger(cols) ||
      cols <= 0
    ) {
      throw new Error("rows and cols must be positive integers");
    }
    this.rows = rows;
    this.cols = cols;
    this.data = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => cloneValue(fill))
    );
    this._mode = null; // lazy mode detection
    this._ops = null;
  }

  // build from an existing 2D array
  static fromArray(arr) {
    if (!Array.isArray(arr) || !Array.isArray(arr[0])) {
      throw new Error("Input must be a 2D array");
    }
    const m = new Matrix(arr.length, arr[0].length);
    for (let i = 0; i < m.rows; i++) {
      if (arr[i].length !== m.cols)
        throw new Error("Jagged array not supported");
      for (let j = 0; j < m.cols; j++) {
        m.data[i][j] = cloneValue(arr[i][j]);
      }
    }
    m._detectMode();
    return m;
  }

  clone() {
    const m = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        m.data[i][j] = cloneValue(this.data[i][j]);
      }
    }
    m._mode = this._mode;
    m._ops = this._ops;
    return m;
  }

  _detectMode() {
    // If already set, keep it
    let foundComplex = false;
    let foundBigInt = false;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const v = this.data[i][j];
        if (isComplex(v)) {
          foundComplex = true;
          break;
        }
        if (isBigInt(v)) foundBigInt = true;
      }
      if (foundComplex) break;
    }
    if (foundComplex) {
      this._mode = NumericMode.COMPLEX;
    } else if (foundBigInt) {
      this._mode = NumericMode.BIGINT;
      // convert any number entries to BigInt (warning: fractional parts lost)
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          const v = this.data[i][j];
          if (isNumber(v)) {
            this.data[i][j] = BigInt(Math.trunc(v));
          }
        }
      }
    } else {
      this._mode = NumericMode.NUMBER;
    }
    this._ops = new NumOps(this._mode);
    return this._mode;
  }

  _ensureMode() {
    if (!this._mode) this._detectMode();
  }

  dimension() {
    return `${this.rows} x ${this.cols}`;
  }

  set(r, c, value) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) {
      throw new Error("Index out of bounds");
    }
    this.data[r][c] = cloneValue(value);
    // Invalidate mode if new value introduces new type
    this._mode = null;
    this._ops = null;
  }

  get(r, c) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) {
      throw new Error("Index out of bounds");
    }
    return cloneValue(this.data[r][c]);
  }

  print() {
    this._ensureMode();
    const ops = this._ops;

    // Convert values to display format before logging
    const formatted = this.data.map((row) => row.map((v) => ops.toDisplay(v)));

    console.table(formatted);
  }

  toArray() {
    return this.data.map((r) => r.map((c) => cloneValue(c)));
  }

  // transpose (returns new Matrix)
  transpose() {
    const res = new Matrix(this.cols, this.rows);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        res.data[j][i] = cloneValue(this.data[i][j]);
      }
    }
    res._detectMode();
    return res;
  }

  // conjugate transpose for complex (returns new Matrix)
  conjugateTranspose() {
    const res = new Matrix(this.cols, this.rows);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const val = this.data[i][j];
        if (isComplex(val)) {
          res.data[j][i] = { re: val.re, im: -val.im };
        } else if (isBigInt(val) || isNumber(val)) {
          res.data[j][i] = cloneValue(val);
        } else {
          res.data[j][i] = cloneValue(val);
        }
      }
    }
    res._detectMode();
    return res;
  }

  // multiplication: returns new Matrix (this * other)
  multiply(other) {
    if (!(other instanceof Matrix))
      throw new Error("multiply argument must be Matrix");
    if (this.cols !== other.rows)
      throw new Error("Dimension mismatch for multiply");
    // Determine resulting mode: follow auto-detect on merged data
    const result = new Matrix(this.rows, other.cols);
    // choose combined mode: if either complex -> complex; else if either bigint -> bigint else number
    const combinedMode = (() => {
      this._ensureMode();
      other._ensureMode();
      if (
        this._mode === NumericMode.COMPLEX ||
        other._mode === NumericMode.COMPLEX
      )
        return NumericMode.COMPLEX;
      if (
        this._mode === NumericMode.BIGINT ||
        other._mode === NumericMode.BIGINT
      )
        return NumericMode.BIGINT;
      return NumericMode.NUMBER;
    })();
    const ops = new NumOps(combinedMode);
    // copy/coerce inputs into working representations
    const a = this.toArray();
    const b = other.toArray();

    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        let sum = ops.zero();
        for (let k = 0; k < this.cols; k++) {
          const av = coerceToMode(a[i][k], combinedMode);
          const bv = coerceToMode(b[k][j], combinedMode);
          const prod = ops.mul(av, bv);
          sum = ops.add(sum, prod);
        }
        result.data[i][j] = sum;
      }
    }
    result._mode = combinedMode;
    result._ops = new NumOps(combinedMode);
    return result;
  }

  // equality check with tolerance for numbers/complex
  equals(other, tol = 1e-9) {
    if (!(other instanceof Matrix)) return false;
    if (this.rows !== other.rows || this.cols !== other.cols) return false;
    this._ensureMode();
    other._ensureMode();
    if (this._mode !== other._mode) return false;
    const ops = this._ops;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (!ops.eq(this.data[i][j], other.data[i][j], tol)) return false;
      }
    }
    return true;
  }

  // helper to check structural types & special matrices
  isZeroMatrix() {
    this._ensureMode();
    return this.data.every((row) => row.every((v) => this._ops.isZero(v)));
  }

  isSquare() {
    return this.rows === this.cols;
  }

  isRowMatrix() {
    return this.rows === 1 && this.cols >= 1;
  }

  isColumnMatrix() {
    return this.cols === 1 && this.rows >= 1;
  }

  isIdentity() {
    if (!this.isSquare()) return false;
    this._ensureMode();
    const ops = this._ops;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const v = this.data[i][j];
        if (i === j) {
          if (!ops.eq(v, ops.one())) return false;
        } else {
          if (!ops.isZero(v)) return false;
        }
      }
    }
    return true;
  }

  isDiagonal() {
    if (!this.isSquare()) return false;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (i !== j && !this._ops.isZero(this.data[i][j])) return false;
      }
    }
    return true;
  }

  isScalarMatrix() {
    // diagonal with all diagonal entries equal (and not necessarily 1)
    if (!this.isDiagonal()) return false;
    const diagVal = this.data[0][0];
    for (let i = 1; i < this.rows; i++) {
      if (!this._ops.eq(this.data[i][i], diagVal)) return false;
    }
    return true;
  }

  isSymmetric() {
    if (!this.isSquare()) return false;
    this._ensureMode();
    // For complex matrices symmetric is A == A^T ; Hermitian is conjugate transpose
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j <= i; j++) {
        if (!this._ops.eq(this.data[i][j], this.data[j][i])) return false;
      }
    }
    return true;
  }

  isHermitian() {
    // A == A^H (conjugate transpose)
    if (!this.isSquare()) return false;
    this._ensureMode();
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const a = this.data[i][j];
        const b = this._ops.conjugate(this.data[j][i]);
        if (!this._ops.eq(a, b)) return false;
      }
    }
    return true;
  }

  isUpperTriangular() {
    if (!this.isSquare()) return false;
    this._ensureMode();
    for (let i = 1; i < this.rows; i++) {
      for (let j = 0; j < i; j++) {
        if (!this._ops.isZero(this.data[i][j])) return false;
      }
    }
    return true;
  }

  isLowerTriangular() {
    if (!this.isSquare()) return false;
    this._ensureMode();
    for (let i = 0; i < this.rows; i++) {
      for (let j = i + 1; j < this.cols; j++) {
        if (!this._ops.isZero(this.data[i][j])) return false;
      }
    }
    return true;
  }

  // Orthogonal (real) or Unitary (complex): A * A^T (or A * A^H) == I
  isOrthogonal(tol = 1e-9) {
    this._ensureMode();
    if (!this.isSquare()) return false;
    if (this._mode === NumericMode.BIGINT) {
      throw new Error("Orthogonal/Unitary check not supported for BigInt mode");
    }
    let other;
    if (this._mode === NumericMode.COMPLEX) {
      other = this.conjugateTranspose();
    } else {
      other = this.transpose();
    }
    const prod = this.multiply(other);
    const id = Matrix.identity(this.rows, this._mode);
    return prod.equals(id, tol);
  }

  // compute determinant (Gaussian elimination with row swaps)
  determinant() {
    if (!this.isSquare())
      throw new Error("Determinant only defined for square matrices");
    this._ensureMode();
    const n = this.rows;
    // Make a copy to operate on
    const A = this.toArray().map((r) => r.map((c) => cloneValue(c)));
    const ops = this._ops;
    let det = ops.one();
    let sign = 1;
    for (let i = 0; i < n; i++) {
      // find pivot (non-zero) in column i at or below row i
      let pivotRow = -1;
      for (let r = i; r < n; r++) {
        if (!ops.isZero(A[r][i])) {
          pivotRow = r;
          break;
        }
      }
      if (pivotRow === -1) {
        return ops.zero(); // determinant zero
      }
      if (pivotRow !== i) {
        // swap rows
        [A[i], A[pivotRow]] = [A[pivotRow], A[i]];
        sign = -sign;
      }
      const pivot = A[i][i];
      det = ops.mul(det, pivot);

      // eliminate below
      for (let r = i + 1; r < n; r++) {
        if (ops.isZero(A[r][i])) continue;
        // multiplier = A[r][i] / pivot
        const mult = ops.div(A[r][i], pivot);
        for (let c = i; c < n; c++) {
          const prod = ops.mul(mult, A[i][c]);
          A[r][c] = ops.sub(A[r][c], prod);
        }
      }
    }
    if (sign === -1) {
      if (this._mode === NumericMode.BIGINT) det = -det;
      else det = -det;
    }
    return det;
  }

  // inverse via Gauss-Jordan elimination
  inverse() {
    if (!this.isSquare())
      throw new Error("Inverse only defined for square matrices");
    this._ensureMode();
    const n = this.rows;
    if (this._mode === NumericMode.BIGINT) {
      // BigInt inverse generally not supported unless specialized rational arithmetic used.
      throw new Error(
        "Inverse for BigInt matrices is not supported in this implementation"
      );
    }
    const ops = this._ops;
    // build augmented matrix [A | I]
    const A = this.toArray().map((r) => r.map((c) => cloneValue(c)));
    const aug = Array.from({ length: n }, (_, i) =>
      Array.from({ length: 2 * n }, (_, j) => {
        if (j < n) return cloneValue(A[i][j]);
        return j - n === i ? ops.one() : ops.zero();
      })
    );

    // Gauss-Jordan
    for (let col = 0; col < n; col++) {
      // find non-zero pivot
      let pivotRow = -1;
      for (let r = col; r < n; r++) {
        if (!ops.isZero(aug[r][col])) {
          pivotRow = r;
          break;
        }
      }
      if (pivotRow === -1)
        throw new Error("Matrix is singular (non-invertible)");
      // swap
      if (pivotRow !== col) {
        [aug[col], aug[pivotRow]] = [aug[pivotRow], aug[col]];
      }
      // normalize pivot row
      const pivot = aug[col][col];
      // divide entire row by pivot
      for (let j = 0; j < 2 * n; j++) {
        aug[col][j] = ops.div(aug[col][j], pivot);
      }
      // eliminate other rows
      for (let r = 0; r < n; r++) {
        if (r === col) continue;
        const factor = aug[r][col];
        if (ops.isZero(factor)) continue;
        for (let j = 0; j < 2 * n; j++) {
          const prod = ops.mul(factor, aug[col][j]);
          aug[r][j] = ops.sub(aug[r][j], prod);
        }
      }
    }

    // extract right half as inverse
    const inv = new Matrix(n, n);
    inv._mode = this._mode;
    inv._ops = this._ops;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        inv.data[i][j] = aug[i][n + j];
      }
    }
    return inv;
  }

  // rank via row-reduction
  rank(tol = 1e-9) {
    this._ensureMode();
    if (this._mode === NumericMode.BIGINT) {
      // For BigInt, we can attempt integer row-reduction (no division) using only swaps and integer row ops.
      // Simple approach: convert to Number temporarily for rank computation (may lose precision),
      // but this is acceptable in many use-cases. We'll convert to Number with warning.
      // Alternatively, one could implement more careful integer row reduction — omitted for brevity.
      console.warn(
        "Rank: converting BigInt matrix to Number for rank computation (possible precision loss)."
      );
    }
    // Convert to Number/Complex as needed for row ops (we'll use ops.div)
    const m = this.rows,
      n = this.cols;
    const A = this.toArray().map((r) => r.map((c) => cloneValue(c)));
    const ops = this._ops;
    let rank = 0;
    let row = 0;
    for (let col = 0; col < n && row < m; col++) {
      // find pivot
      let sel = row;
      while (sel < m && ops.isZero(A[sel][col])) sel++;
      if (sel === m) continue; // no pivot in this column
      // swap
      [A[row], A[sel]] = [A[sel], A[row]];
      // normalize pivot row
      const pivot = A[row][col];
      for (let j = col + 1; j < n; j++) {
        if (ops.isZero(A[row][j])) continue;
        const mult = ops.div(A[row][j], pivot);
        // eliminate other entries in column for rows below
        for (let i = row + 1; i < m; i++) {
          const tosub = ops.mul(A[i][col], mult);
          A[i][j] = ops.sub(A[i][j], tosub); // this is a rough reduction; optimal implementations differ
        }
      }
      row++;
      rank++;
    }
    return rank;
  }

  // Returns a string describing the matrix type (composed of detected properties).
  type() {
    this._ensureMode();
    if (this.isZeroMatrix()) return "Zero Matrix";
    if (this.isIdentity()) return "Identity Matrix";
    if (this.isDiagonal()) return "Diagonal Matrix";
    if (this.isScalarMatrix()) return "Scalar Matrix";
    if (this.isHermitian()) return "Hermitian Matrix";
    if (this.isSymmetric()) return "Symmetric Matrix";
    if (this.isUpperTriangular()) return "Upper Triangular Matrix";
    if (this.isLowerTriangular()) return "Lower Triangular Matrix";
    if (this.isRowMatrix()) return "Row Matrix";
    if (this.isColumnMatrix()) return "Column Matrix";
    if (this.isSquare()) return "Square Matrix";
    return "Rectangular Matrix (General)";
  }

  // static helper: identity matrix (mode optional: 'number' | 'bigint' | 'complex')
  static identity(n, mode = NumericMode.NUMBER) {
    const m = new Matrix(n, n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        m.data[i][j] =
          i === j
            ? mode === NumericMode.BIGINT
              ? 1n
              : mode === NumericMode.COMPLEX
              ? complex(1, 0)
              : 1
            : mode === NumericMode.BIGINT
            ? 0n
            : mode === NumericMode.COMPLEX
            ? complex(0, 0)
            : 0;
      }
    }
    m._mode = mode;
    m._ops = new NumOps(mode);
    return m;
  }
}

/* ---------------- Utility coercion ---------------- */

function coerceToMode(val, mode) {
  if (mode === NumericMode.COMPLEX) {
    if (isComplex(val)) return cloneValue(val);
    if (isBigInt(val)) return complex(Number(val), 0);
    if (isNumber(val)) return complex(val, 0);
    // fallback to zero
    return complex(0, 0);
  }
  if (mode === NumericMode.BIGINT) {
    if (isBigInt(val)) return val;
    if (isNumber(val)) return BigInt(Math.trunc(val));
    if (isComplex(val)) throw new Error("Cannot coerce Complex to BigInt");
    return BigInt(val);
  }
  // number mode
  if (isComplex(val)) {
    if (val.im === 0) return val.re;
    throw new Error("Cannot coerce complex with imag part to number");
  }
  if (isBigInt(val)) return Number(val);
  return Number(val);
}

export { NumericMode };
