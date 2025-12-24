# Atlas Server

Atlas Server  is a small collection of backend helper classes for Node.js (MERN Stack style).



## Features

- Database: Connect to MongoDB Atlas with a primary +srv URL and a fallback standard URL.
- Server: Lightweight wrapper for starting an Express server with safe defaults and helper methods for routing.
- Github: Helper to fetch repository metadata, readme URL, contributors, releases and assets using the GitHub REST API.

## Requirements

- Node.js (v22+ recommended)
- npm


## Install
```bash
# from project root
npm install atlas-server
```

## Project Directory Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── testController.js
│   ├── db/
│   │   └── dbConfig.js
│   ├── routes/
│   │   └── testRouter.js
│   ├── server/
│   │   └── server.js
│   └── index.js
├── .gitignore
├── LICENSE
├── package.json
└── README.md

```


## Usage


in your main index file:
```javascript
// src/index.js
import "dotenv/config";
import database from "./db/dbConfig.js";
import server from "./server/server.js";

const isDBConnected = await database.connect();
if (isDBConnected) {
	console.log("Connected"); 
	await server.Start();
} else {
	console.error("Connection failed");
}
```
Notes:
- The `connect()` method returns a boolean (true = connected, false = not connected).

in your server file:
```javascript
// src/server/server.js
import { Server } from "atlas-server";

const server = new Server(5000);
server.connectFrontend("your-frontend-url");

// Route definitions here
import testRouter from "./routes/testRouter.js";
server.Route("/test", testRouter);

export default server;
```
in your database config file:
```javascript
// src/db/dbConfig.js
import { Database } from "atlas-server";

const database = new Database({
	subdomain: "yourAtlasSubdomain",
	username: "dbUser",
	password: "dbPassword",
	cluster: "cluster0",
	dbName: "myDatabase",
});

export default database;
```
Notes:
- Provide your own Atlas credentials, do not commit secrets to source control.


in your route file:
```javascript
// src/routes/testRouter.js
import { Router } from "atlas-server";
import { testController } from "../controllers/testController.js";
const testRouter = new Router();
testRouter.post("/hi", testController);
export default testRouter;
```



in your controller file:
```javascript
// src/controllers/testController.js
import { AsyncHandler } from "atlas-server";
export const testController = AsyncHandler(async (req, res) => {
  const body = req.body;
  res.json({ success: true, message: body });
});

```





### Github helper

The `Github` class wraps a few GitHub API calls for repo metadata.

Constructor: `new Github(username, token)` — token should be a personal access token with repo/read permissions for private repos.

Main methods:
- `repoInfo(repoName)` — returns an object with name, fullName, visibility, description, stars, forks, watchers, license, sizeKB, createdAt, updatedAt, pushedAt, contributors (array), releases (array), readmeDownloadUrl, url, logoUrl, assets (array).
- `repoAssets(repoName)` — returns an array of release assets with inferred `osType`.

Example:

```javascript
import { Github } from "atlas-server";

const gh = new Github("yourUsername", "yourToken");
const info = await gh.repoInfo("your-repo-name");
console.log(info);
```

Security note: keep `token` secure and prefer environment variables.

## API Reference (summary)

- Database(config).connect(): Promise<boolean>
	- config: { subdomain, username, password, cluster, dbName }
	- Returns: true if connected, false otherwise.

- Server(port)
	- connectFrontend(frontendUrl): void — enables CORS for a single frontend origin
	- start(): Promise<void> — starts the server
	- Router(): Router — returns an Express router
	- Use(route, router): void — mounts router

- Github(username, token)
	- repoInfo(repoName): Promise<object|null>
	- repoAssets(repoName): Promise<array|null>

## Examples and testing

- `src/test.js` contains an example that creates a `Database` and `Server` instance then starts the server. It uses explicit credentials in the example — replace them with environment variables before running.

Recommended local development flow:

1. Create `.env` (do not commit it) with DB credentials and other secrets.
2. Modify `src/test.js` to load credentials from `process.env`.
3. Run `npm install` then `npm run test`.

## Contributing

If you'd like to contribute:

1. Open an issue describing the feature or bug.
2. Send a pull request with a clear description and tests where applicable.

Small proactive suggestions for the repo:
- Move credentials in `src/test.js` to environment variables (e.g., `process.env.MONGO_USER`).
- Add a `.env.example` to show required variables.
- Populate the `LICENCE` file (package.json states `ISC`).

## License

This project declares `ISC` in `package.json`. Please add a full `LICENCE` file at the repo root if you want the text present in the repository.

## Author

Mohammad Mahfuz Rahman

---

If you'd like, I can:

- Replace the hard-coded credentials usage with `process.env` in `src/test.js` and add a `.env.example` file.
- Add a short unit test to validate `Github.repoAssets` and `repoInfo` shapes (with mocked axios responses).

Tell me which of the two (or both) you'd like me to implement next.
