import axios from "axios";

const getDocs = () => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        "http://localhost:3000/document/findById",
        {},
        { withCredentials: true }
      )
      .then((response) => {
        if (response.statusText !== "OK") {
          reject("Something went wrong!!");
        } else {
          if (response.error) {
            reject(response.message);
          }
          resolve(response.data);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getCollabDocs = () => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        "http://localhost:3000/document/findByCollabId",
        {},
        { withCredentials: true }
      )
      .then((response) => {
        if (response.statusText !== "OK") {
          reject("Something went wrong!!");
        } else {
          if (response.error) {
            reject(response.message);
          }
          resolve(response.data);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getAllDocs = async () => {
  try {
    const [docs, collabDocs] = await Promise.all([getDocs(), getCollabDocs()]);
    const updatedCollabDocs = collabDocs.map((doc) => ({
      ...doc,
      type: "collab",
    }));
    const allDocs = [...docs, ...updatedCollabDocs];
    return allDocs;
  } catch (error) {
    throw new Error("Failed to fetch all documents");
  }
};

const createDocument = (filename) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        "http://localhost:3000/document/create",
        { title: filename },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.statusText !== "OK") {
          reject(new Error("Failed to create document"));
        }
        resolve("Document created successfully");
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        reject(new Error("Some Error Occurred!!"));
      });
  });
};

const getDocByID = (id) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `http://localhost:3000/document/getDoc`,
        { id: id },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.statusText !== "OK") {
          reject(new Error("Failed to delete document"));
        }
        resolve(response.data);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        reject(new Error("Some Error Occurred!!"));
      });
  });
};

const getActiveMember = (fileId) => {
  console.log(fileId);
  return new Promise((resolve, reject) => {
    axios
      .post(
        `http://localhost:3000/document/getActiveMember`,
        { fileId },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.statusText !== "OK") {
          reject(new Error("Failed to delete document"));
        }
        resolve(response.data);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        reject(new Error("Some Error Occurred!!"));
      });
  });
};

const deleteDocument = (id) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        "http://localhost:3000/document/delete",
        { id: id },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.statusText !== "OK") {
          reject(new Error("Failed to delete document"));
        }
        resolve("Document delete successfully");
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        reject(new Error("Some Error Occurred!!"));
      });
  });
};

const sendCollabRequest = (userEmail, fileId) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        "http://localhost:3000/document/collabRequest",
        { userEmail: userEmail, fileId: fileId },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.statusText !== "OK") {
          reject("Failed to sent request");
        } else {
          resolve("Request Sent successfully");
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        reject("Some Error Occurred!!");
      });
  });
};

const acceptCollabRequest = (token) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        "http://localhost:3000/document/addCollab",
        { fileId: token },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.status === 200) {
          resolve("Collab Request Accepted");
        } else {
          console.log(response);
          reject("Failed to send request");
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const updateDoc = (id, title, content) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        "http://localhost:3000/document/update",
        { id, title, content },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.statusText !== "OK") {
          reject("Failed to save document");
        }
        resolve("Document saved!! successfully");
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        reject(error.response.data.message || "Some Error Occurred!!");
      });
  });
};

export {
  createDocument,
  getAllDocs,
  getCollabDocs,
  getDocs,
  getDocByID,
  deleteDocument,
  sendCollabRequest,
  acceptCollabRequest,
  getActiveMember,
  updateDoc,
};
