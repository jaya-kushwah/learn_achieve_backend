const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const isValid = allowedTypes.test(ext);
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, .webp files are allowed'));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
