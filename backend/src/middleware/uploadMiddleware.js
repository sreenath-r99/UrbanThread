import multer from "multer";

// Store the uploaded image temporarily in memory.
// It will be sent directly to Cloudinary.
const storage = multer.memoryStorage();

// Allow only supported image formats.
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
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

const upload = multer({
  storage,
  fileFilter,

  limits: {
    // Maximum image size: 2 MB
    fileSize: 2 * 1024 * 1024,
  },
});

export default upload;