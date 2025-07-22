const express = require('express');
const multer = require('multer');
const { uploadDocument } = require('../Controllers/tutorController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    // Extract user_id and document_type from req.body
    const userId = req.body.user_id || 'unknownUser';
    const documentType = req.body.document_type ? req.body.document_type.replace(/\s+/g, '_') : 'unknownType';

    const originalName = file.originalname;
    const timestamp = Date.now();

    // Construct the new filename
    const newFileName = `${userId}_${documentType}_${originalName}`;

    cb(null, newFileName);
  }
});

const upload = multer({ storage });

router.post('/upload-document', upload.single('document'), uploadDocument);

module.exports = router;
