# Atlas Server

Atlas Server  is a small collection of backend helper classes for Node.js (MERN-style stacks). It provides simple utilities to connect to MongoDB Atlas, create an Express-based server with common middleware, and fetch GitHub repository metadata.

This README documents the public API, installation, quickstart examples, and notes about running the included examples.

## Features

- Database: Connect to MongoDB Atlas with a primary +srv URL and a fallback standard URL.
- Server: Lightweight wrapper for starting an Express server with safe defaults and helper methods for routing and CORS.
- Github: Helper to fetch repository metadata, readme URL, contributors, releases and assets using the GitHub REST API.

## Requirements

- Node.js (v16+ recommended)
- npm

The package declares the following runtime dependencies (see `package.json`): `axios`, `cookie-parser`, `cors`, `express`, `mongoose`.

## Install


```bash
# from project root
npm install atlas-server
```

To run the example/test file used during development:

```bash
npm run test
```

> Note: `npm run test` starts `nodemon src/test.js` as shipped. `src/test.js` contains example usage and may attempt to connect to an external MongoDB Atlas cluster — do not run it with embedded credentials. Replace credentials with your own or run examples locally behind a firewall.

## Quickstart

Below are example usages mirroring the classes in `src/index.js`.

### Database

The `Database` class provides a `connect()` method that first tries the MongoDB +srv URL then a fallback standard connection string.

Example:

```javascript
import { Database } from "./src/index.js";

const database = new Database({
	subdomain: "yourAtlasSubdomain",
	username: "dbUser",
	password: "dbPassword",
	cluster: "cluster0",
	dbName: "myDatabase",
});

const ok = await database.connect();
if (ok) console.log("Connected"); else console.error("Connection failed");
```

Notes:
- Provide your own Atlas credentials; do not commit secrets to source control.
- The `connect()` method returns a boolean (true = connected, false = not connected).

### Server

The `Server` class wraps an Express app and wires a set of sensible middleware.

API sketch:
- constructor(port) — creates a server bound to `port`.
- connectFrontend(frontendUrl) — configures CORS to allow `frontendUrl` with credentials.
- start() — starts listening (async function that resolves once listening handler runs).
- Router() — convenience wrapper returning `express.Router()`.
- Use(route, router) — mount a router at `route`.

Example:

```javascript
import { Server } from "./src/index.js";

const server = new Server(5000);
server.connectFrontend("http://localhost:5173");

const router = server.Router();
router.get("/ping", (req, res) => res.json({ ok: true }));

server.Use("/api", router);
await server.start();
```

### Github helper

The `Github` class wraps a few GitHub API calls for repo metadata.

Constructor: `new Github(username, token)` — token should be a personal access token with repo/read permissions for private repos.

Main methods:
- `repoInfo(repoName)` — returns an object with name, fullName, visibility, description, stars, forks, watchers, license, sizeKB, createdAt, updatedAt, pushedAt, contributors (array), releases (array), readmeDownloadUrl, url, logoUrl, assets (array).
- `repoAssets(repoName)` — returns an array of release assets with inferred `osType`.

Example:

```javascript
import { Github } from "./src/index.js";

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
