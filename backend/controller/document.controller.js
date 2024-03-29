const Document = require("../models/Document");
const User = require("../models/User");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const createDocument = async (req, res, next) => {
  if (!req.isAuthenticated) {
    let err = new Error("Document Creation failed: Login Required");
    err.statusCode = error.statusCode;
    next(err);
  }
  const { title, content } = req.body;
  const email = req.email;
  const userID = req.userId;
  console.log(email);
  try {
    const newDocument = await Document.create({
      userId: email,
      title: title,
      content: content,
    });
    newDocument.collaborators.push({
      userId: userID,
      username: email,
      role: "owner",
    });
    await newDocument.save();
    res.status(200).json(newDocument);
  } catch (error) {
    console.log(error);
    let err = new Error("Document Creation failed: " + error.message);
    err.statusCode = error.statusCode;
    next(err);
  }
};

const findDocument = async (req, res, next) => {
  const { id } = req.body;
  try {
    const document = await Document.findById(id);
    res.status(200).json(document);
  } catch (error) {
    console.log(error);
    let err = new Error("Document Creation failed: " + error.message);
    err.statusCode = error.statusCode;
    next(err);
  }
};

const findDocumentsByUserId = async (req, res, next) => {
  try {
    const userID = req.email;
    const documents = await Document.find({ userId: userID });
    res.status(200).json(documents);
  } catch (error) {
    console.log(error);
    let err = new Error("Document Creation failed: " + error.message);
    err.statusCode = error.statusCode;
    next(err);
  }
};

const findCollabDocumentsByUserId = async (req, res, next) => {
  try {
    const userID = req.userId;
    const documents = await Document.find({
      collaborators: {
        $elemMatch: {
          userId: userID,
          role: { $ne: "owner" },
        },
      },
    });
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error finding documents by user ID:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};

const docByID = async (req, res, next) => {
  try {
    const { id } = req.body;
    const document = await Document.findById(id);
    res.status(200).json(document);
  } catch (error) {
    console.log(error);
    let err = new Error("Document Finding failed: " + error.message);
    err.statusCode = error.statusCode;
    next(err);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.body;
    const deletedDocument = await Document.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    console.log(error);
    let err = new Error("Document Creation failed: " + error.message);
    err.statusCode = error.statusCode;
    next(err);
  }
};

const updateDocument = async (req, res, next) => {
  try {
    const { id, title, content } = req.body;
    const updatedDocument = await Document.findById(id);
    if (!updatedDocument) {
      throw new Error("Document not found!!");
    }

    const change = {
      userId: req.userId,
      changeType: "update",
      oldTitle: updatedDocument.title,
      oldContent: updatedDocument.content,
      newTitle: title,
      newContent: content,
      timestamp: new Date(),
    };

    // Update the document with new title and content
    updatedDocument.title = title;
    updatedDocument.content = content;

    // Add the change to the changes array
    updatedDocument.changes.push(change);

    await updatedDocument.save();
    res.status(200).json(updatedDocument);
  } catch (error) {
    console.log(error);
    let err = new Error("Document Creation failed: " + error.message);
    err.statusCode = error.statusCode;
    next(err);
  }
};

const addCollaborator = async (req, res, next) => {
  try {
    const { fileId } = req.body;
    const document = await Document.findById(fileId);

    const existingCollaborator = document.collaborators.find(
      (collaborator) => collaborator.userId === req.userId
    );
    if (existingCollaborator) {
      res.status(400).send("User is already a collaborator on this document");
      return;
    } else {
      document.collaborators.push({
        userId: req.userId,
        username: req.email,
        role: "editor",
      });
      await document.save();
      res.status(200).json(document);
    }
  } catch (error) {
    console.log(error);
    let err = new Error("Collab Adding failed: " + error.message);
    err.statusCode = error.statusCode;
    next(err);
  }
};

const getActiveMember = async (req, res, next) => {
  try {
    const { fileId } = req.body;
    const users = await User.find({
      activeDocuments: {
        $elemMatch: {
          documentId: fileId, // Assuming 'fileId' is the field to match against in 'activeDocuments'
        },
      },
    });

    if (!users || users.length === 0) {
      // No users found
      return res.status(404).json({
        message:
          "No users found with active documents containing the specified fileId",
      });
    }

    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    let err = new Error("Collab Adding failed: " + error.message);
    err.statusCode = error.statusCode;
    next(err);
  }
};

const removeCollaborator = async (req, res, next) => {
  try {
    const { documentId, collaboratorId } = req.body;
    const updatedDocument = await Document.findByIdAndUpdate(
      documentId,
      { $pull: { collaborators: { userId: collaboratorId } } },
      { new: true }
    );

    await updateDocument.save();
    res.status(200).json(updatedDocument);
  } catch (error) {
    console.log(error);
    let err = new Error("Document Creation failed: " + error.message);
    err.statusCode = error.statusCode;
    next(err);
  }
};

const addChange = async (req, res, next) => {
  try {
    const { documentId, change } = (req, res, next);
    const updatedDocument = await Document.findByIdAndUpdate(
      documentId,
      { $push: { changes: change } },
      { new: true }
    );
    await updateDocument.save();
    res.status(200).json(updatedDocument);
  } catch (error) {
    console.log(error);
    let err = new Error("Document Creation failed: " + error.message);
    err.statusCode = error.statusCode;
    next(err);
  }
};

const collabRequest = async (req, res, next) => {
  const { userEmail, fileId } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: "Collab Request - Document Editor",
    text: `Click the following link to accept collab request send from ${req.email}: http://localhost:3000/collab-request/${fileId}`,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({
    message: "Request sent Successfully",
  });
};

module.exports = {
  createDocument,
  findDocument,
  findDocumentsByUserId,
  findCollabDocumentsByUserId,
  deleteDocument,
  updateDocument,
  addCollaborator,
  getActiveMember,
  removeCollaborator,
  addChange,
  collabRequest,
  docByID,
};
