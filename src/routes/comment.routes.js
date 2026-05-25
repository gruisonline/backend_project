import { Router } from "express";
import { 
  addComment,
  getVideoComments,
  updateComment,
  deleteComment
 } from "../controllers/comment.controllers.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router()
router.use(verifyJwt)

router.route("/:videoId")
  .get(getVideoComments)
  .post(addComment)

router.route("/:commentId")
  .patch(updateComment)
  .delete(deleteComment)

export default router