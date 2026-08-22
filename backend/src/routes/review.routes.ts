import { Router } from "express";
import * as reviews from "../controllers/review.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { ah } from "../utils/asyncHandler";

export const reviewRouter = Router();

reviewRouter.get("/product/:productId", ah(reviews.listProductReviews));
reviewRouter.post("/", authenticate, validate(reviews.reviewSchema), ah(reviews.createReview));
