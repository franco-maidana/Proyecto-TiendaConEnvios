import { Router } from "express";
import ApiRouter from "./api/index.api.router.js";

const indexRouter = Router()

indexRouter.use('/api', ApiRouter)

export default indexRouter