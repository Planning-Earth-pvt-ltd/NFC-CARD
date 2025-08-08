const multer = require('multer');
const path = require('path');

// Storage location and filename settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // folder where files will be saved
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  }
});

// File type filter
function fileFilter(req, file, cb) {
  const allowedImage = ['.jpg', '.jpeg', '.png', '.gif'];
  const allowedDoc = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'image') {
    if (!allowedImage.includes(ext)) {
      return cb(new Error('Only image files allowed!'));
    }
  }

  if (file.fieldname === 'document') {
    if (!allowedDoc.includes(ext)) {
      return cb(new Error('Only document files allowed!'));
    }
  }

  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

module.exports = upload;
