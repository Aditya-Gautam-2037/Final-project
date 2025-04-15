// controllers/fileUploadController.js
const path = require('path');

const handleFileUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  res.status(200).json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    filepath: `/uploads/${req.file.filename}`
  });
};

module.exports = {
  handleFileUpload,
};
