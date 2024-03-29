import React, { useState, useEffect, useRef } from "react";
import "./DocEditor.css";
import Cookies from "universal-cookie";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Avatar, { genConfig } from "react-nice-avatar";
import {
  authenticateUser,
  manageUser,
  setActiveDoc,
  removeActiveDoc,
} from "../js/auth.js";
import {
  sendCollabRequest,
  getDocByID,
  getActiveMember,
  updateDoc,
} from "../js/doc.js";
import socketIOClient from "socket.io-client";

function DocEditor() {
  const [user, setUser] = useState({});
  const [doc, setDoc] = useState({});
  const [collab, setCollabs] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [cursors, setCursors] = useState({});
  const [editorContent, setEditorContent] = useState("");
  const [savingStatus, setSavingStatus] = useState("Saved!!");
  const navigate = useNavigate();
  const { docId } = useParams();
  const socketRef = useRef();

  //Document Saving...
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSavingStatus("Saving...");
      if (editorContent && editorContent.length > 0) {
        updateDoc(docId, doc.title, editorContent)
          .then(() => {
            setSavingStatus("Saved!!");
          })
          .catch((error) => {
            setSavingStatus("Saving failed!");
            showToast(error);
          });
      } else {
        setSavingStatus("Saved!!");
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [editorContent]);

  //socketIO
  useEffect(() => {
    if (Object.keys(user).length === 0) {
      return;
    }
    socketRef.current = socketIOClient("http://localhost:3002");

    socketRef.current.on("connect", function () {
      const username = user.email.split("@")[0];
      socketRef.current.emit("storeClientInfo", {
        customId: user._id,
        username: username,
      });
      socketRef.current.emit("joinRoom", docId);
    });

    socketRef.current.on("cursorUpdate", ({ userId, position, text }) => {
      setEditorContent(text);
    });

    socketRef.current.on(
      "mouseCursorUpdate",
      ({ userId, username, position }) => {
        setCursors((prevCursors) => ({
          ...prevCursors,
          [userId]: { username, position },
        }));
      }
    );

    return () => {
      socketRef.current.disconnect();
    };
  }, [user]);

  //send mouse cursor position update
  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    if (socketRef.current == null) {
      return;
    }
    socketRef.current.emit("mouseCursorUpdate", {
      userId: user._id,
      doc: docId,
      x: clientX,
      y: clientY,
    });
  };

  //send cursor and text update
  const handleEditorChange = (event) => {
    setEditorContent(event.target.value);
    if (socketRef.current == null) {
      return;
    }
    socketRef.current.emit("cursorUpdate", {
      doc: docId,
      position: event.target.selectionStart,
      text: event.target.value,
    });
  };

  const openDialog = () => {
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
  };

  const handleEmailChange = (event) => {
    setCollaboratorEmail(event.target.value);
  };

  //check user's authentication
  useEffect(() => {
    const cookies = new Cookies();
    const verifyUser = async () => {
      const jwt = cookies.get("token");
      if (!jwt) {
        navigate("/login");
      } else {
        authenticateUser().catch((error) => {
          cookies.remove("token");
          navigate("/login");
        });
      }
    };
    verifyUser();
  }, [navigate]);

  //user's info
  useEffect(() => {
    manageUser().then((user) => {
      setUser(user);
    });
  }, []);

  //retrieve doc info
  useEffect(() => {
    if (docId == null) {
      return;
    }
    getDocByID(docId)
      .then((doc) => {
        setDoc(doc);
        setEditorContent(doc.content);
        setCollabs(doc.collaborators);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [docId]);

  //showToast
  const showToast = (message, timeout) => {
    const outTime = timeout || 3000;
    const existingToasts = document.querySelectorAll(".toast");
    const toast =
      existingToasts.length > 0
        ? existingToasts[0]
        : document.createElement("div");
    toast.classList.add("toast");
    toast.textContent = message;

    document.body.appendChild(toast);

    toast.addEventListener("click", () => toast.remove());

    setTimeout(() => {
      toast.remove();
    }, outTime);
  };

  //Invite Collab
  const inviteCollaborator = () => {
    // Perform invitation logic here
    console.log("Inviting collaborator with email:", collaboratorEmail);
    sendCollabRequest(collaboratorEmail, docId)
      .then((message) => {
        showToast(message);
      })
      .catch((error) => {
        showToast(error);
      })
      .finally(() => {
        closeDialog();
      });
    // Close the dialog after inviting
  };

  return (
    <div key="main-editor" className="main-editor">
      <div key="aside-editor" className="aside-editor">
        <img key="logo" className="logo" src="../logo.png" alt="logo" />
        <div className="user-area">
          <h5 style={{ width: "fit-content" }}>{savingStatus}</h5>
          <h4 style={{ width: "fit-content" }}>All Users</h4>
          {collab.map((user, index) => (
            <div key={user._id} className="userHolder">
              <Avatar
                style={{ width: "36px", height: "36px" }}
                {...genConfig(user.username.split("@")[0])}
              />
              <div className="username">{user.username.split("@")[0]}</div>
            </div>
          ))}
        </div>
        <div className="controls">
          <button className="invite" onClick={() => setShowDialog(true)}>
            Invite
          </button>
          <button
            onClick={() => {
              navigate("/home");
            }}
          >
            Leave
          </button>
        </div>
      </div>
      <textarea
        className="editorWrap-editor"
        value={editorContent}
        onChange={handleEditorChange}
        onMouseMove={handleMouseMove}
        placeholder="Start Typing..."
      />
      {showDialog && (
        <div className="dialog">
          <h2>Invite Collaborator</h2>
          <input
            type="email"
            value={collaboratorEmail}
            onChange={handleEmailChange}
            style={{ width: "100%", backgroundColor: "#efefef" }}
            placeholder="Enter collaborator's email"
          />
          <div style={{ display: "flex" }}>
            <button onClick={inviteCollaborator}>Invite</button>
            <button onClick={closeDialog}>Cancel</button>
          </div>
        </div>
      )}
      {Object.entries(cursors).map(([userId, { username, position }]) => {
        return (
          <div
            key={userId}
            style={{
              position: "absolute",
              top: position.y,
              left: position.x,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "white",
                fontSize: "8px",
                backgroundColor: "transparent",
                padding: "2px 4px",
                borderRadius: "5px",
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: stringToColor(username),
                  marginRight: "5px",
                  position: "relative",
                }}
              ></div>
              <span>{username}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  function stringToColor(str) {
    // Hash the string to get a numeric value
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate a color based on the hash value
    const color =
      "#" +
      ((((hash >> 24) & 0xff) % 200) + 55).toString(16) + // Ensure red component is not too low
      ((((hash >> 16) & 0xff) % 200) + 55).toString(16) + // Ensure green component is not too low
      ((((hash >> 8) & 0xff) % 200) + 55).toString(16); // Ensure blue component is not too low

    return color;
  }
}

export default DocEditor;
