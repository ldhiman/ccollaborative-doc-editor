// user.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "user",
    },
    resetToken: String,
    resetTokenExpiration: Date,
    activeDocuments: [
      {
        documentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Document",
        },
        lastOpened: Date,
      },
    ],
    preferences: {
      theme: {
        type: String,
        default: "light",
      },
      fontSize: {
        type: Number,
        default: 14,
      },
      autoSave: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

userSchema.methods.generateAccessJWT = function () {
  let payload = {
    id: this._id,
  };
  return jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

userSchema.statics.getUserIdFromToken = function(token) {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

// Hash the password
userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Checking if password is valid
userSchema.methods.validPassword = async function (password) {
  return await bcrypt.compareSync(password, this.password);
};

// Generate a password reset token
userSchema.methods.generateResetToken = function () {
  this.resetToken = crypto.randomBytes(20).toString("hex");
  this.resetTokenExpiration = Date.now() + 3600000;
  return this.resetToken;
};

userSchema.methods.validResetToken = function () {
  return (
    this.resetToken &&
    this.resetTokenExpiration &&
    Date.now() < this.resetTokenExpiration
  );
};

// Clear/reset the reset token after it's used
userSchema.methods.clearResetToken = function () {
  this.resetToken = undefined;
  this.resetTokenExpiration = undefined;
};

// Update password
userSchema.methods.updatePassword = function (newPassword) {
  this.password = this.generateHash(newPassword);
};

// Method to add a new active document
userSchema.methods.addActiveDocument = function (documentId) {
  this.activeDocuments.push({ documentId, lastOpened: Date.now() });
};

// Method to remove an active document
userSchema.methods.removeActiveDocument = function (documentId) {
  this.activeDocuments = this.activeDocuments.filter(
    (doc) => doc.documentId.toString() !== documentId.toString()
  );
};

userSchema.methods.updateUserInfo = async function (userInfo) {
  try {
    for (let key in userInfo) {
      if (userInfo.hasOwnProperty(key)) {
        if (key !== "password") {
          this[key] = userInfo[key];
        } else {
          this.password = this.generateHash(userInfo[key]);
        }
      }
    }
    await this.save();
    return { message: "User information updated successfully" };
  } catch (error) {
    return {
      error: true,
      message: "Failed to update user information: " + error.message,
    };
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
