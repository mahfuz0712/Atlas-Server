import "dotenv/config";
import {
  Github,
  Stack,
  Matrix,
  Matrix as M,
  NumericMode, Vector, Graph
} from "../index.js";




// const user = "mahfuz0712";
// const repoName = "BornomalaScript";
// const token = process.env.githubToken;

// const gitHub = new Github(user, token);
// const repoInfo = await gitHub.repoInfo(repoName);

// console.log("Logo:", repoInfo.logoUrl);
// console.log("Name:", repoInfo.name);
// console.log("FullName:", repoInfo.fullName);
// console.log("Visibility:", repoInfo.visibility);
// console.log("Description:", repoInfo.description);
// console.log("Stars:", repoInfo.stars);
// console.log("Forks:", repoInfo.forks);
// console.log("Watchers:", repoInfo.watchers);
// console.log("License:", repoInfo.license);
// console.log("Size:", repoInfo.sizeKB);
// console.log("CreatedAt:", repoInfo.createdAt);
// console.log("UpdatedAt:", repoInfo.updatedAt);
// console.log("PushedAt:", repoInfo.pushedAt);
// console.log("Contributors:", repoInfo.contributors);
// console.log("Realeses:", repoInfo.releases);
// console.log("ReadmeDownloadURL:", repoInfo.readmeDownloadUrl);
// console.log("URL:", repoInfo.url);

// console.log("Assets:", repoInfo.assets);

// import { Cache } from './cache.mjs';
// const cache = new Cache({ stdTTL: 60 });

// // Store objects with tags
// cache.setItem("user1", { name: "Alice" }, 30, "users", ["active-users", "premium"]);
// cache.setItem("user2", { name: "Bob" }, 30, "users", ["active-users"]);

// // Delete all keys with a tag
// cache.clearTag("active-users"); // removes user1 and user2

// // Store configs in a namespace with tags
// cache.setItem("config1", { theme: "dark" }, 60, "settings", ["configs"]);
// cache.setItem("config2", { theme: "light" }, 60, "settings", ["configs"]);

// // Clear all configs by tag
// cache.clearTag("configs");

// // Clear a namespace
// cache.clearNamespace("users");

// // Clear everything
// cache.clearNamespace();

// Example usage:
// const stack = new Stack();
// const myObj = {
//   name: "Mohammad",
//   age: 22
// }
// stack.push(myObj, 2, myObj);

// console.log(stack.peek());

// // Use array methods and still get a Stack
// const newStack = stack.filter(x => x % 2 === 1);
// console.log(newStack instanceof Stack); // true
// console.log(newStack); // [1, 3]

// // Normal stack operations
// console.log(stack.pop()); // 3
// console.log(stack.isEmpty()); // false

// Usage
// Example 1: your example usage
// const matA = new Matrix(3, 3);
// const matB = new Matrix(3, 2);

// matA.set(0, 0, 1);
// matA.set(1, 1, 1);
// matA.set(2, 2, 1);

// matA.print();
// console.log("dim:", matA.dimension());
// console.log("type:", matA.type());

// matB.set(0, 0, 1);
// matB.set(2, 1, 1);
// matB.print();

// const product = matA.multiply(matB);
// product.print();
// console.log("product type:", product.type());

// // Example 2: complex matrix
// const C = Matrix.fromArray([
//   [{ re: 1, im: 0 }, { re: 2, im: 1 }],
//   [{ re: 2, im: -1 }, { re: 3, im: 0 }]
// ]);
// console.log("C type:", C.type());
// console.log("C determinant:", C.determinant());
// const invC = C.inverse();
// console.log("C * C^-1 equals identity?", C.multiply(invC).type());

// // Example 3: BigInt
// const B1 = Matrix.fromArray([[1n, 2n], [3n, 4n]]);
// console.log("BigInt mode type:", B1.type());
// console.log("BigInt determinant:", B1.determinant()); // works with integer arithmetic
// // B1.inverse() -> will throw: inverse for BigInt not supported




// const a = new Vector(3, 4);
// const b = new Vector(1, 2, 3);

// console.log(a.add(b).toString());       // (4, 6, 3)
// console.log(a.dot(b));                  // 11
// console.log(a.cross(b).toString());     // (12, -9, 2)
// console.log(a.magnitude());             // 5
// console.log(b.normalize().toString());  // (0.267, 0.535, 0.802)



// const graph = new Graph({ mode: '2D', outputFile: 'graph2d.png' });

// graph.addFunction(x => x*x+6, 'blue')
//      .addVector(new Vector(2,3), 'red')
//      .render();

// const graph3D = new Graph({ mode: '3D', outputFile: 'graph3d.png' });
// graph3D.addFunction((x,y) => x*y, 'purple')
//        .addVector(new Vector(1,2,3), 'red')
//        .render();