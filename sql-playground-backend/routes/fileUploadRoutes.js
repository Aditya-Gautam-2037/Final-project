// routes/fileUploadRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { handleFileUpload } = require('../controllers/fileUploadController');

const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post('/', upload.single('file'), handleFileUpload);

module.exports = router;
