import axios from "axios";

const authenticateUser = () => {
  return new Promise((resolve, reject) => {
    axios
      .post("https://ccollaborative-doc-editor-api.vercel.app//", {}, { withCredentials: true })
      .then((response) => {
        if (response.statusText !== "OK") {
          reject(new Error("Failed to authenticate user"));
        }
        if (response.data) {
          resolve(response.data);
        } else {
          reject(new Error("No response data"));
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const resetPassword = (email) => {
  const postData = { email: email };
  return new Promise((resolve, reject) => {
    axios
      .post("https://ccollaborative-doc-editor-api.vercel.app//auth/requestPasswordReset", postData, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.statusText !== "OK") {
          reject("Failed to reset password");
        } else {
          resolve("Password reset request sent!");
        }
      })
      .catch((error) => {
        reject(error.response.data.message || "Some Error Occurred!!");
        console.error("There was a problem with the axios operation:", error);
      });
  });
};

const handleRegister = (email, password) => {
  const postData = {
    email: email,
    password: password,
    name: email.split("@")[0],
  };

  return new Promise((resolve, reject) => {
    axios
      .post("https://ccollaborative-doc-editor-api.vercel.app//auth/register", postData, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.statusText !== "OK") {
          reject("Failed to register");
        } else if (response.data.error) {
          reject(response.data.message);
        } else {
          handleLogin(email, password)
            .then((loginResponse) => resolve(loginResponse))
            .catch((loginError) => reject(loginError));
        }
      })
      .catch((error) => {
        reject(error.response.data.message || "Some Error Occurred!!");
        console.error("There was a problem with the axios operation:", error);
      });
  });
};

const handleLogin = (email, password) => {
  const postData = { email: email, password: password };
  return new Promise((resolve, reject) => {
    axios
      .post("https://ccollaborative-doc-editor-api.vercel.app//auth/login", postData, {
        withCredentials: true,
      })
      .then((response) => {
        console.log(response);
        if (response.statusText !== "OK") {
          reject("Failed to login");
        } else if (response.data.error) {
          reject(response.data.message);
        } else {
          resolve("navigate to home!!");
        }
      })
      .catch((error) => {
        reject(error.response.data.message || "Some Error Occurred!!");
        console.error("There was a problem with the axios operation:", error);
      });
  });
};

const manageUser = () => {
  return new Promise((resolve, reject) => {
    axios
      .get("https://ccollaborative-doc-editor-api.vercel.app//auth/profile", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.statusText !== "OK" || response.data === null) {
          reject("Failed to fetch profile");
        } else if (response.data.error) {
          reject(response.data.message);
        } else {
          resolve(response.data);
        }
      })
      .catch((error) => {
        reject(error.response.data.message || "Some Error Occurred!!");
        console.error("There was a problem with the axios operation:", error);
      });
  });
};

const updateUser = (data) => {
  return new Promise((resolve, reject) => {
    axios
      .post("https://ccollaborative-doc-editor-api.vercel.app//auth/profile", data, {
        withCredentials: true,
      })
      .then((response) => {
        console.log(response);
        if (response.statusText !== "OK") {
          reject("Failed to logout");
        } else if (response.data.error) {
          reject(response.data.message);
        } else {
          resolve(response.data);
        }
      })
      .catch((error) => {
        reject(error.response.data.message || "Some Error Occurred!!");
        console.error("There was a problem with the axios operation:", error);
      });
  });
};

const Logout = () => {
  return new Promise((resolve, reject) => {
    axios
      .post("https://ccollaborative-doc-editor-api.vercel.app//auth/logout", {
        withCredentials: true,
      })
      .then((response) => {
        console.log(response);
        if (response.statusText !== "OK") {
          reject("Failed to login");
        } else if (response.data.error) {
          reject(response.data.message);
        } else {
          resolve(response.data);
        }
      })
      .catch((error) => {
        reject(error.response.data.message || "Some Error Occurred!!");
        console.error("There was a problem with the axios operation:", error);
      });
  });
};

const setActiveDoc = (documentId) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        "https://ccollaborative-doc-editor-api.vercel.app//auth/setActiveDoc",
        { documentId },
        { withCredentials: true }
      )
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error.response.data.message || "Failed to set active document");
        console.error("There was a problem with the axios operation:", error);
      });
  });
};

const removeActiveDoc = (documentId) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        "https://ccollaborative-doc-editor-api.vercel.app//auth/removeActiveDoc",
        { documentId },
        { withCredentials: true }
      )
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(
          error.response.data.message || "Failed to remove active document"
        );
        console.error("There was a problem with the axios operation:", error);
      });
  });
};

export {
  authenticateUser,
  removeActiveDoc,
  setActiveDoc,
  handleLogin,
  handleRegister,
  resetPassword,
  manageUser,
  updateUser,
  Logout,
};
