import "dotenv/config";
import server from "./src/server/server.js";
import database from "./src/db/dbConfig.js";


const isDBConnected = await database.connect();

if (isDBConnected) {
  console.log("database connected");
  await server.Start();
} else {
  console.error("Database connection failed");
}