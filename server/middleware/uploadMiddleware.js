const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists in server/uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedOriginal}`);
  },
});

// File filter for documents, PDFs, videos, and images
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /pdf|doc|docx|ppt|pptx|txt|mp4|webm|zip|png|jpg|jpeg|svg/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (allowedExtensions.test(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Unsupported file format. Allowed formats: pdf, doc, docx, ppt, pptx, txt, mp4, webm, zip, png, jpg.'
      )
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB maximum file size
  fileFilter,
});

module.exports = upload;
