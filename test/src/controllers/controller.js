import { AsyncHandler } from "../../../index.js";

export const testController = AsyncHandler(async (req, res) => {
  const body = req.body;
  res.json({ success: true, message: body });
});
