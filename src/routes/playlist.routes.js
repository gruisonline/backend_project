import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist
} from "../controllers/playlist.controllers.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJwt);

router.route("/").post(createPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

router.route("/:playlistId")
  .get(getPlaylistById)
  .delete(deletePlaylist)
  .patch(updatePlaylist);
  
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)

export default router