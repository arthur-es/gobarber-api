import { Router } from "express";
import multer from "multer";
const routes = new Router();

import UserController from "./app/controllers/UserController";
import SessionController from "./app/controllers/SessionController";
import FileController from "./app/controllers/FileController";
import ProviderController from "./app/controllers/ProviderController";
import AppointmentController from "./app/controllers/AppointmentController";

import authMiddleware from "./app/middlewares/auth";

import multerConfig from "./config/multer";
const upload = multer(multerConfig);

routes.post("/users", UserController.store);
routes.post("/sessions", SessionController.store);

routes.use(authMiddleware);

routes.get("/providers", ProviderController.index);
routes.post("/files", upload.single("file"), FileController.store);
routes.post("/appointments", AppointmentController.store);
routes.put("/users", UserController.update);

export default routes;
