const express = require("express");
const {
  loginUser,
  registerUser,
  logout,
  requestPasswordReset,
  resetPassword,
  getProfile,
  editProfile,
  setActiveDoc,
  removeActiveDoc,
} = require("../controller/auth.controller.js");

const authRoutes = express.Router();

authRoutes.post("/login", loginUser);
authRoutes.post("/register", registerUser);
authRoutes.post("/logout", logout);
authRoutes.post("/setActiveDoc", setActiveDoc);
authRoutes.post("/removeActiveDoc", removeActiveDoc);
authRoutes.post("/requestPasswordReset", requestPasswordReset);
authRoutes.post("/resetPassword", resetPassword);
authRoutes.get("/profile", getProfile);
authRoutes.post("/profile", editProfile);

module.exports = authRoutes;
