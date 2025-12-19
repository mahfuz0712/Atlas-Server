import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

export class Server {
  constructor(port) {
    this.port = port;
    this.server = express();
    this.Router = express.Router();

    // Default middleware
    this.server.use(express.json());
    this.server.use(express.urlencoded({ extended: true }));
    this.server.use(express.static("public"));
    this.server.use(cookieParser());
    this.server.use((req, res, next) => {
      res.setHeader("Content-Security-Policy", "default-src 'self'");
      res.setHeader("X-Content-Type-Options", "nosniff");
      next();
    });
  }

  connectFrontend(frontendUrl) {
    if (!frontendUrl) {
      console.error("Please provide a frontend url");
      return;
    }

    this.server.use(
      cors({
        origin: frontendUrl,
        credentials: true,
      })
    );

    console.log(`Frontend allowed: ${frontendUrl}`);
  }

  async start() {
    this.server.listen(this.port, () => {
      console.log(`Server running on ${this.port}`);
    });
  }

  Route(route, router) {
    this.server.use(route, router);
  }
  Router() {
    return this.Router
  }
}