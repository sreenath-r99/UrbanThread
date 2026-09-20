import multer from "multer";

/*
|--------------------------------------------------------------------------
| MEMORY STORAGE
|--------------------------------------------------------------------------
*/

const storage =
  multer.memoryStorage();

/*
|--------------------------------------------------------------------------
| IMAGE TYPE VALIDATION
|--------------------------------------------------------------------------
*/

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (
    allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, PNG, and WEBP images are allowed"
      ),
      false
    );
  }
};

/*
|--------------------------------------------------------------------------
| PROFILE IMAGE UPLOAD
|--------------------------------------------------------------------------
|
| Maximum: 2 MB
| One image
|
*/

export const uploadProfile =
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize:
        2 * 1024 * 1024,
      files: 1,
    },
  });

/*
|--------------------------------------------------------------------------
| PRODUCT IMAGE UPLOAD
|--------------------------------------------------------------------------
|
| Maximum: 5 MB each
| Maximum: 5 images
|
*/

export const uploadProductImages =
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize:
        5 * 1024 * 1024,
      files: 5,
    },
  });

/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
|
| Keep this so any existing code using:
|
| import upload from "./uploadMiddleware.js"
|
| continues to work.
|
*/

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize:
      2 * 1024 * 1024,
    files: 1,
  },
});

export default upload;