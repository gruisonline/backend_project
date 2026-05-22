import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo
} from "../controllers/video.controller.js"
import { verifyJwt } from "../middlewares/auth.middlewares.js"
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJwt);

router.route("/")
.get(getAllVideos)
.post(
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

router.route("/:videoId").get(getVideoById)
router.route("/update-video/:videoId").patch(upload.single("thumbnail"), updateVideo)

export default router;