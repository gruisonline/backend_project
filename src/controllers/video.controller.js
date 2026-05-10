import { asyncHandler } from '../utils/asyncHandler.js';
import { Video } from '../models/video.models.js';
import { User } from '../models/user.models.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const getAllVideos = asyncHandler(async (req, res) => {

})

const publishAVideo = asyncHandler( async (req, res) => {
  const { title, description } = req.body

  if(
    [title, description].some((field) => !field || field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required.")
  }

  const videoFileLocalPath = req.files?.videoFile[0]?.path

  const thumbnailLocalPath =
  req.files &&
  Array.isArray(req.files.thumbnail) &&
  req.files.thumbnail.length > 0
    ? req.files.thumbnail[0].path
    : null

  if(!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required!")
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath)
  const thumbnail = thumbnailLocalPath 
  ? await uploadOnCloudinary(thumbnailLocalPath)
  : null

  if(!videoFile) {
    throw new ApiError(400, "Video file is required!")
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.secure_url,
    thumbnail: thumbnail?.secure_url || "",
    duration: videoFile.duration || "",
    owner: req.user._id
  })

  if(!video) {
    throw new ApiError(500, "Something went wrong while uploading the video!")
  }

  return res.status(201).json(
    new ApiResponse(200, video, "Video uploaded Successfully")
  )

})

export {
  getAllVideos,
  publishAVideo
}