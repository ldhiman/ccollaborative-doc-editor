const User = require("../models/User.js");

const updateUser = async (email, userInfo) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("User not Found!!");
    }
    const response = await user.updateUserInfo(userInfo);
    return response;
  } catch (Error) {
    return {
      error: true,
      message: "Profile Update Failed: " + Error.message,
    };
  }
};

const findUserById = async (id) =>{
  const user = await User.findById(id, {password: 0});
  if (!user) {
    throw new Error("User not Found!!");
  }
  return user;
}

module.exports = { updateUser, findUserById };
