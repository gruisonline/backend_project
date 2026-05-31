import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if(!name?.trim()) {
    throw new ApiError(400, "Name is required!")
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description: description?.trim() || "",
    owner: req.user?._id
  })

  return res.status(201).json(
    new ApiResponse(201, playlist, "Playlist created successfully!")
  )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
  const {userId} = req.params;

  if(!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID!")
  }

  const userPlaylists = await Playlist.find({owner: userId})

  if(userPlaylists.length <= 0) {
    throw new ApiError(404, "User has no Playlist!")
  }

  return res.status(200).json(
    new ApiResponse(200, userPlaylists, "User playlists fetched successfully!")
  )
})

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params

  if(!isValidObjectId) {
    throw new ApiError(400, "Invalid playlist ID!")
  }

  const playlist = await Playlist.findById(playlistId)
    .populate("owner", "username fullName avatar")
    .populate("videos");

  if(!playlist) {
    throw new ApiError(404, "Playlist not found!")
  }

  return res.status(200).json(
    new ApiResponse(200, playlist, "Playlist fetched successfully!")
  )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params

  if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID!")
  }

  const playlist = await Playlist.findById(playlistId)

  if(!playlist) {
    throw new ApiError(404, "Playlist not found!")
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found!");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: { videos: videoId }
    },
    { new: true }
  ).populate("videos");

  if (!updatedPlaylist) {
    throw new ApiError(500, "Failed to add video");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedPlaylist,
      "Video added to playlist successfully!"
    )
  );

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params

  if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID!")
  }

  const playlist = await Playlist.findById(playlistId)

  if(!playlist) {
    throw new ApiError(404, "Playlist does not exists!")
  }

  if(playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Unauthorized!")
  } 

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {videos: videoId}
    },
    {
      returnDocument: "after"
    }
  ).populate("videos");

  return res.status(200).json(
    new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully!")
  )

})

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params

  if(!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid Playlist ID!")
  }

  const deletePlaylist = await Playlist.findByIdAndDelete(
    {
      _id: playlistId,
      owner: req.user._id
    }
  );

  if(!deletePlaylist) {
    throw new ApiError(404, "Playlist not found or unauthorized!")
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Playlist deleted successfully!")
  )
})

const updatePlaylist = asyncHandler( async (req, res) => {
  const { playlistId } = req.params
  const { name, description } = req.body

  if(!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid  playlist ID!")
  }

  if(!name?.trim()) {
    throw new ApiError(400, "Name field is required!")
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    {
      _id: playlistId,
      owner: req.user._id
    },
    {
      $set: {
        name: name.trim(),
        description: description?.trim() || "",
      }
    },
    {
      returnDocument: "after"
    }
  )

  if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist not found or unauthorized!");
  }

  return res.status(200).json(
    new ApiResponse(200, updatedPlaylist, "Playlist updated successfully!")
  )
})

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist
}