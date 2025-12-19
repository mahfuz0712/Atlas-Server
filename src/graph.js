import { createCanvas } from "canvas";
import fs from "fs";

export class Graph {
  constructor({
    width = 800,
    height = 600,
    mode = "2D",        // "2D" | "3D"
    coordinate = "cartesian",
    bgColor = "#fff",
    outputFile = "graph.png",
  } = {}) {
    this.width = width;
    this.height = height;
    this.mode = mode;
    this.coordinate = coordinate;
    this.bgColor = bgColor;
    this.outputFile = outputFile;

    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext("2d");

    this.scale = 40; // pixels per unit

    this.functions = [];
    this.vectors = [];
    this.matrices = [];
    this.points = [];
  }

  addFunction(fn, color = "blue") {
    this.functions.push({ fn, color });
    return this;
  }

  addVector(vector, color = "red") {
    this.vectors.push({ vector, color });
    return this;
  }

  addMatrix(matrix, color = "green") {
    this.matrices.push({ matrix, color });
    return this;
  }

  addPoints(pointsArray, color = "black") {
    this.points.push({ pointsArray, color });
    return this;
  }

  clear() {
    const ctx = this.ctx;
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  render() {
    this.clear();
    if (this.mode === "2D") this._render2D();
    else if (this.mode === "3D") this._render3D();

    // Save to file
    const buffer = this.canvas.toBuffer("image/png");
    fs.writeFileSync(this.outputFile, buffer);
    console.log(`Graph saved to ${this.outputFile}`);
  }

  // -------------------------------
  // 2D render
  // -------------------------------
  _render2D() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const s = this.scale;

    // Axes
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();

    const mapX = x => w / 2 + x * s;
    const mapY = y => h / 2 - y * s;

    // Functions
    this.functions.forEach(({ fn, color }) => {
      ctx.strokeStyle = color;
      ctx.beginPath();
      const step = 1 / s;
      for (let x = -w / 2 / s; x <= w / 2 / s; x += step) {
        const y = this.coordinate === "polar" ? fn(x) : fn(x);
        const cx = mapX(x);
        const cy = mapY(this.coordinate === "polar" ? y * Math.sin(x) : y);
        if (x === -w / 2 / s) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    });

    // Vectors
    this.vectors.forEach(({ vector, color }) => {
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(mapX(0), mapY(0));
      ctx.lineTo(mapX(vector.x), mapY(vector.y));
      ctx.stroke();
    });

    // Matrices
    this.matrices.forEach(({ matrix, color }) => {
      ctx.fillStyle = color;
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.cols; j++) {
          const x = j;
          const y = matrix.get(i, j);
          ctx.fillRect(mapX(x) - 2, mapY(y) - 2, 4, 4);
        }
      }
    });

    // Raw points
    this.points.forEach(({ pointsArray, color }) => {
      ctx.fillStyle = color;
      pointsArray.forEach(([x, y]) => {
        ctx.fillRect(mapX(x) - 2, mapY(y) - 2, 4, 4);
      });
    });
  }

  // -------------------------------
  // Basic 3D render (projection)
  // -------------------------------
  _render3D() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const s = this.scale;

    const project = (x, y, z) => {
      const factor = 0.5;
      return [
        w / 2 + (x - z) * factor * s,
        h / 2 - (y - z) * factor * s,
      ];
    };

    // Vectors
    this.vectors.forEach(({ vector, color }) => {
      ctx.strokeStyle = color;
      ctx.beginPath();
      const [x0, y0] = project(0, 0, 0);
      const [x1, y1] = project(vector.x, vector.y, vector.z);
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    });

    // Functions z=f(x,y)
    this.functions.forEach(({ fn, color }) => {
      ctx.fillStyle = color;
      const step = 1;
      for (let x = -5; x <= 5; x += step / s) {
        for (let y = -5; y <= 5; y += step / s) {
          const z = fn(x, y);
          const [px, py] = project(x, y, z);
          ctx.fillRect(px, py, 2, 2);
        }
      }
    });

    // Matrices as height maps
    this.matrices.forEach(({ matrix, color }) => {
      ctx.fillStyle = color;
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.cols; j++) {
          const z = matrix.get(i, j);
          const [px, py] = project(i, j, z);
          ctx.fillRect(px, py, 2, 2);
        }
      }
    });
  }
}
