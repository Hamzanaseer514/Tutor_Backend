const asyncHandler = require("express-async-handler");
const TutorDocument = require("../Models/tutorDocumentSchema");

const uploadDocument = asyncHandler(async (req, res) => {
  const { user_id, document_type } = req.body;

  if (!req.file || !user_id || !document_type) {
    res.status(400);
    throw new Error("All fields and file are required");
  }

  const newDoc = await TutorDocument.create({
    user_id,
    document_type,
    file_url: `/uploads/documents/${req.file.filename}`,
    uploaded_at: new Date(),
    verified_by_admin: false,
    verification_status: "Pending"
  });

  res.status(201).json({
    message: "Document uploaded successfully",
    document: newDoc
  });
});

module.exports = {
  uploadDocument
};

