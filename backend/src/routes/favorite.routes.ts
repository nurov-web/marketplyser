import { Router } from "express";
import * as fav from "../controllers/favorite.controller";
import { authenticate } from "../middleware/auth";
import { ah } from "../utils/asyncHandler";

export const favoriteRouter = Router();

favoriteRouter.use(authenticate);
favoriteRouter.get("/", ah(fav.listFavorites));
favoriteRouter.post("/", ah(fav.toggleFavorite));
favoriteRouter.post("/:productId", ah(fav.toggleFavorite));
