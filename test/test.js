import "dotenv/config";
import { Database, Server, Github } from "../index.js";

const database = new Database({
  subdomain: process.env.MONGO_SUBDOMAIN,
  username: process.env.MONGO_USERNAME,
  password: process.env.MONGO_PASSWORD,
  cluster: process.env.MONGO_CLUSTER,
  dbName: process.env.MONGO_DBNAME,
});

const server = new Server(5000);

const isDBConnected = await database.connect();

if (isDBConnected) {
  console.log("database connected");
  server.connectFrontend("http://localhost:5173");
  await server.start();
} else {
  console.error("Database connection failed");
}

const user = "mahfuz0712";
const repoName = "BornomalaScript";
const token = process.env.githubToken;

const gitHub = new Github(user, token);
const repoInfo = await gitHub.repoInfo(repoName);

console.log("Logo:", repoInfo.logoUrl);
console.log("Name:", repoInfo.name);
console.log("FullName:", repoInfo.fullName);
console.log("Visibility:", repoInfo.visibility);
console.log("Description:", repoInfo.description);
console.log("Stars:", repoInfo.stars);
console.log("Forks:", repoInfo.forks);
console.log("Watchers:", repoInfo.watchers);
console.log("License:", repoInfo.license);
console.log("Size:", repoInfo.sizeKB);
console.log("CreatedAt:", repoInfo.createdAt);
console.log("UpdatedAt:", repoInfo.updatedAt);
console.log("PushedAt:", repoInfo.pushedAt);
console.log("Contributors:", repoInfo.contributors);
console.log("Realeses:", repoInfo.releases);
console.log("ReadmeDownloadURL:", repoInfo.readmeDownloadUrl);
console.log("URL:", repoInfo.url);

console.log("Assets:", repoInfo.assets);


import { Cache } from './cache.mjs';
const cache = new Cache({ stdTTL: 60 });

// Store objects with tags
cache.setItem("user1", { name: "Alice" }, 30, "users", ["active-users", "premium"]);
cache.setItem("user2", { name: "Bob" }, 30, "users", ["active-users"]);

// Delete all keys with a tag
cache.clearTag("active-users"); // removes user1 and user2

// Store configs in a namespace with tags
cache.setItem("config1", { theme: "dark" }, 60, "settings", ["configs"]);
cache.setItem("config2", { theme: "light" }, 60, "settings", ["configs"]);

// Clear all configs by tag
cache.clearTag("configs");

// Clear a namespace
cache.clearNamespace("users");

// Clear everything
cache.clearNamespace();
