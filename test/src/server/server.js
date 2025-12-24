import { Server } from "../../../index.js";

const server = new Server(5000);
server.connectFrontend("*");

// Routes Configuration
import testRouter from "../routes/router.js";
server.Route("/", testRouter)


export default server;