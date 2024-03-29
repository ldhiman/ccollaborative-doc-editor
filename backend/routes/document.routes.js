const express = require("express");

const {
  createDocument,
  findDocument,
  findDocumentsByUserId,
  deleteDocument,
  updateDocument,
  addCollaborator,
  docByID,
  findCollabDocumentsByUserId,
  removeCollaborator,
  addChange,
  collabRequest,
  getActiveMember,
} = require("../controller/document.controller.js");

const docRoutes = express.Router();

docRoutes.post("/create", createDocument);
docRoutes.post("/findById", findDocumentsByUserId);
docRoutes.post("/findByCollabId", findCollabDocumentsByUserId);
docRoutes.post("/getDoc", docByID);
docRoutes.post("/getActiveMember", getActiveMember);
docRoutes.post("/find", findDocument);
docRoutes.post("/delete", deleteDocument);
docRoutes.post("/update", updateDocument);
docRoutes.post("/addCollab", addCollaborator);
docRoutes.post("/removeCollab", removeCollaborator);
docRoutes.post("/change", addChange);
docRoutes.post("/collabRequest", collabRequest);

module.exports = docRoutes;
