import { Router } from "../../../index.js";
import { testController } from "../controllers/controller.js";
const testRouter = new Router();

testRouter.post("/hi", testController);


export default testRouter;