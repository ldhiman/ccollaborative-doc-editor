const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const collaborativeDBConnection = mongoose.createConnection(
  `${process.env.DATABASE_URL}/documentDB`
);

const collaborativeDocumentSchema = new mongoose.Schema(
  {
    userId: String,
    title: String,
    content: String,
    collaborators: [
      {
        userId: {
          type: String,
          required: true,
          unique: true,
        },
        username: String,
        role: String,
      },
    ],
    changes: [
      {
        userId: String,
        changeType: String,
        oldTitle: String,
        oldContent: String,
        newTitle: String,
        newContent: String,
        timestamp: Date,
      },
    ],
  },
  { timestamps: true }
);

const Document = collaborativeDBConnection.model(
  "CollaborativeDocument",
  collaborativeDocumentSchema
);

module.exports = Document;
