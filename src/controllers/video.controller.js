import { asyncHandler } from '../utils/asyncHandler.js';
import { Video } from '../models/video.models.js';
import { User } from '../models/user.models.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { deleteFromCloudinary } from '../utils/deleteFromCloudinary.js';
import mongoose from 'mongoose';

const getAllVideos = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    query, 
    sortBy, 
    sortType, 
    userId 
  } = req.query


  const pegNumber = parseInt(page)
  const limitNumber = parseInt(limit)
  const skip = (pegNumber - 1) * limitNumber

  const filter = {}

  if(query) {
    filter.$or = [
      { 
        title: { 
          $regex: query, 
          $options: "i" 
        } 
      },
      { 
        description: { 
          $regex: query, 
          $options: "i" 
        } 
      }
    ]
  }

  if(userId) {
    filter.owner = new mongoose.Types.ObjectId(userId)
  }

  const sortOptions = {}

  if(sortBy) {
    const sortOrder = sortType === "desc" ? -1 : 1
    sortOptions[sortBy] = sortOrder
  } else {
    sortOptions.createdAt = -1
  }

  const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNumber)
    .populate("owner", "username avatar fullname")  

  const totalVideos = await Video.countDocuments(filter)
  const totalPages = Math.ceil(totalVideos / limitNumber) 

  return res.status(200).json(
    new ApiResponse(200, {
      videos,
      totalPages,
      currentPage: pegNumber
    })
  )
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
    videoFile: {
      url: videoFile.secure_url,
      public_id: videoFile?.public_id,
    },
    thumbnail: {
      url: thumbnail?.secure_url || "",
      public_id: thumbnail?.public_id || "",
    },
    duration: videoFile.duration || "",
    owner: req.user._id
  })

  if(!video) {
    throw new ApiError(500, "Something went wrong while uploading the video!")
  }

  const createdVideo = await Video.findById(video._id);

  if (!createdVideo) {
    throw new ApiError(500, "Something went wrong while publishing video");
  }

  return res.status(201).json(
    new ApiResponse(200, createdVideo, "Video uploaded Successfully")
  )

})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  if(!videoId?.trim()) {
    throw new ApiError(400, "Video id is required")
  }

  const video = await Video.findById(videoId)

  if(!video) {
    throw new ApiError(404, "Video not found!")
  }

  return res.status(200).json(
    new ApiResponse(200, video, "Video fetched successfully")
  )
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { title, description } = req.body;

  const thumbnailLocalPath = req.file?.path;

  const existingVideo = await Video.findById(videoId);

  if (!videoId?.trim()) {
    throw new ApiError(400, "Video not found!");
  }

  const updateData = {};

  if(title?.trim()) {
    updateData.title = title
  }

  if(description?.trim()) {
    updateData.description = description
  }

  if(thumbnailLocalPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!thumbnail?.url) {
      throw new ApiError(500, "Thumbnail upload failed");
    }

    updateData.thumbnail = {
      url: thumbnail?.url || "",
      public_id: thumbnail?.public_id || "",
    };

    if (existingVideo.thumbnail?.public_id) {
      await deleteFromCloudinary(existingVideo.thumbnail.public_id);
    }
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updateData,
    },
    {
      new: true,
    }
  );

  if (!video) {
    throw new ApiError(
      404,
      "Video not found"
    );
  }

  return res.status(200).json(
    new ApiResponse(200, video, "Video updated successfully")
  );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if(!videoId?.trim()){
    throw new ApiError(400, "Video not found!")
  }

  const video = await Video.findOneAndDelete(videoId)

  if(!video) {
    throw new ApiError(404, "Video not found!")
  }

  if(video.videoFile?.public_id) {
    await deleteFromCloudinary(video.videoFile.public_id)
  }

  if(video.thumbnail?.public_id) {
    await deleteFromCloudinary(video.thumbnail.public_id)
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Video Deleted Successfully!")
  )
});

const togglePublishedStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if(!videoId?.trim()) {
    throw new ApiError(400, "Video not found!")
  }

  const video = await Video.findById(videoId)
 
  if(!video) {
    throw new ApiError(404, "Video not found!")
  }

  video.isPublished = !video.isPublished

  await video.save({ validateBeforeSave: false })

  return res.status(200).json(
    new ApiResponse(200, video, `Video ${
      video.isPublished 
        ? "published" 
        : "unpublished"
      } successfully!`)
  )

});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishedStatus
}