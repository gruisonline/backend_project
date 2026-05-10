import { Router } from "express";
import {
  publishAVideo
} from "../controllers/video.controller.js"
import { verifyJwt } from "../middlewares/auth.middlewares.js"
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJwt);

router.route("/").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1
    }
  ]),
  publishAVideo
);

export default router;