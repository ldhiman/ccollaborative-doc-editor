const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

const User = require("../models/User.js");
const Blacklist = require("../models/Blacklist.js");

const maxAge = 3 * 24 * 60 * 60;

dotenv.config();

async function sendPasswordResetEmail(email, resetToken) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset",
    text: `Click the following link to reset your password: ${process.env.BASE_URL}/reset-password/${resetToken}`,
  };

  await transporter.sendMail(mailOptions);
}

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      let error = new Error("User not found. Please register first.");
      error.statusCode = 400;
      throw error;
    }
    const isPasswordValid = await user.validPassword(password);
    if (!isPasswordValid) {
      let error = new Error("Invalid Password");
      error.statusCode = 400;
      throw error;
    }

    const token = await user.generateAccessJWT();

    res.cookie("token", token, { withCredentials: true });
    //res.status(200).redirect("/home");
    res.status(200).json({ message: "You have successfully logged in." });
  } catch (error) {
    console.log(error);
    let err = new Error("Authentication failed: " + error.message);
    err.statusCode = 500;
    next(err);
  }
};

const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let user_find = await User.findOne({ email });
    if (user_find) {
      let error = new Error("User already exists!!");
      error.statusCode = 400;
      next(error);
    } else {
      let name = email.split("@")[0];
      var new_user = new User({
        username: name,
        email: email,
      });

      new_user.password = await new_user.generateHash(password);

      await new_user.save();
      res.status(200).json({ message: "Registration Successful!" });
    }
  } catch (err) {
    console.log(err);
    let error = new Error("Registration failed: " + err.message);
    error.statusCode = 400;
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.email }, { password: 0 });
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    let err = new Error("User Fetch failed: " + error.message);
    err.statusCode = 500;
    next(err);
  }
};

const editProfile = async (req, res, next) => {
  try {
    const { name } = req.email;
    const updatedData = {
      username: name,
    };

    const updatedUser = await User.findOneAndUpdate(
      { email: req.email },
      updatedData,
      { new: true }
    );

    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      let err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
  } catch (error) {
    console.error(error);
    let err = new Error("User update failed: " + error.message);
    err.statusCode = 500;
    next(err);
  }
};

// Function to set an active document for a user
const setActiveDoc = async (req, res) => {
  const { documentId } = req.body;

  try {
    // Find the user by userId
    const user = await User.findOne({ email: req.email });

    if (!user) {
      // User not found
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the document is already in the user's activeDocuments array
    const isAlreadyActive = user.activeDocuments.some(
      (doc) => doc.documentId.toString() === documentId
    );

    if (!isAlreadyActive) {
      user.activeDocuments.push({ documentId });

      await user.save();

      return res
        .status(200)
        .json({ message: "Active document added successfully" });
    } else {
      return res
        .status(400)
        .json({ message: "Document is already active for the user" });
    }
  } catch (error) {
    // Handle errors
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Function to remove an active document for a user
const removeActiveDoc = async (req, res) => {
  const { documentId } = req.body; // Assuming userId and documentId are provided in the request body

  try {
    // Find the user by userId
    const user = await User.findOne({ email: req.email });

    if (!user) {
      // User not found
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the document from the activeDocuments array
    user.activeDocuments = user.activeDocuments.filter(
      (doc) => doc.documentId.toString() !== documentId
    );

    // Save the updated user document
    await user.save();

    // Return success response
    return res
      .status(200)
      .json({ message: "Active document removed successfully" });
  } catch (error) {
    // Handle errors
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers["cookie"];
    if (!authHeader) {
      let error = new Error("No Content!!");
      error.statusCode = 204;
      next(error);
    }

    const cookie = authHeader.split("=")[1];
    const accessToken = cookie.split(";")[0];
    const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
    console.log(checkIfBlacklisted);
    if (checkIfBlacklisted) {
      let error = new Error("No Content!!");
      error.statusCode = 204;
      next(error);
    }

    const newBlacklist = new Blacklist({
      token: accessToken,
    });
    await newBlacklist.save();

    res.setHeader("Clear-Site-Data", '"cookies"');
    res.status(200).json({ message: "You are logged out!" });
  } catch (err) {
    console.error("Logout failed:", err);
    let error = new Error("Internal Server Error!!");
    error.statusCode = 500;
    next(error);
  }
  res.end();
};

// Function to handle password reset request
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    // Generate a unique reset token
    const user = await User.findOne({ email: email });

    if (!user) {
      let error = new Error("User not found!!");
      error.statusCode = 400;
      next(error);
    } else {
      console.log(user);
    }

    const resetToken = user.generateResetToken();
    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (err) {
    let error = new Error("Password reset failed: " + err.message);
    error.statusCode = 500;
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      res.status(401).json({ message: "Invalid Token!!" });
    }
    if (user.validResetToken()) {
      user.updatePassword(newPassword);
      user.clearResetToken();
      await user.save();

      res.status(200).json({ message: "Password reset successfully" });
    } else {
      res.status(401).json({ message: "Invalid or Expired Reset Token" });
    }
  } catch (err) {
    let error = new Error("Password reset failed: " + err.message);
    error.statusCode = 500;
    next(error);
  }
};

module.exports = {
  loginUser,
  registerUser,
  logout,
  requestPasswordReset,
  resetPassword,
  getProfile,
  editProfile,
  setActiveDoc,
  removeActiveDoc,
};
