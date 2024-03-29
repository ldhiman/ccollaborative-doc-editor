import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./Home.css";
import Cookies from "universal-cookie";

import { manageUser } from "../js/auth.js";
import Avatar, { genConfig } from "react-nice-avatar";

import {
  createDocument,
  getAllDocs,
  getCollabDocs,
  getDocs,
  deleteDocument,
} from "../js/doc.js";

import { authenticateUser } from "../js/auth.js";

function Home() {
  const [docs, setDocs] = useState([]);
  const [user, setUser] = useState({});
  const [collabDocs, setCollabDocs] = useState([]);
  const [contextMenuPos, setContextMenuPos] = useState(null);
  const [contextId, setContextId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState("");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const navigate = useNavigate();

  const handleContextMenu = (e, id) => {
    e.preventDefault();
    setContextId(id);
    setContextMenuPos({
      posX: e.clientX,
      posY: e.clientY,
    });
  };

  const HandleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/login");
  };

  useEffect(() => {
    const cookies = new Cookies();

    const jwt = cookies.get("token");
    if (!jwt) {
      navigate("/login");
    } else {
      authenticateUser().catch((error) => {
        cookies.remove("token");
        navigate("/login");
      });
    }
  }, [navigate]);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000); // Hide toast after 3 seconds (adjust as needed)
  };

  useMemo(() => {
    manageUser()
      .then((user) => {
        setUser(user);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenuPos(null);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleOpenInNewTab = () => {
    // Open document in a new tab
    setContextMenuPos(null);
    window.open(`/document/${contextId}`, "_blank");
  };

  const getDocsAndCollabDocs = () => {
    getDocs()
      .then((data) => {
        setDocs(data);
      })
      .catch((error) => {
        console.error("Error fetching documents:", error);
      });

    getCollabDocs()
      .then((data) => {
        setCollabDocs(data);
      })
      .catch((error) => {
        console.error("Error fetching collaborative documents:", error);
      });
  };

  useMemo(() => {
    getDocsAndCollabDocs();
  }, []);

  const handleDelete = () => {
    setContextMenuPos(null);
    // Implement delete functionality
    deleteDocument(contextId)
      .then(() => {
        showToastMessage("Document deleted successfully.");

        getDocsAndCollabDocs();

        // You may also refresh the document list or update the UI accordingly
      })
      .catch((error) => {
        showToastMessage("Error deleting document.");

        console.error("Error deleting document:", error);
      });
    console.log("Deleting document...");
  };

  const handleCreateDocument = () => {
    if (newDocumentName.length <= 0) {
      showToastMessage("Document name should not empty.");

      return;
    }
    createDocument(newDocumentName)
      .then(() => {
        showToastMessage("Document created successfully.");

        setShowDialog(false);
        getDocsAndCollabDocs();
      })
      .catch((error) => {
        showToastMessage("Error creating document.");
        console.error("Error creating document:", error);
      });
    setNewDocumentName("");
  };

  return (
    <>
      <div className="container-home">
        <div className="navbar-home">
          <div>
            <img className="logo" src="logo.png" alt="logo" />
          </div>
          <input placeholder="Search" className="search" />
          <div className="user" onClick={() => setShowLogoutDialog(true)}>
            <Avatar
              style={{ width: "36px", height: "36px" }}
              {...genConfig(user.username)}
            />
            <div className="username">{user.username}</div>
          </div>
        </div>
        <div className="docArea">
          {docs.length > 0 ? <h3>Recent Documents</h3> : <></>}
          <div className="selfDocs">
            {docs.map((doc, index) => (
              <Documents
                key={index}
                doc={doc}
                collab={false}
                handleContextMenu={handleContextMenu}
              />
            ))}
          </div>
          {collabDocs.length > 0 ? <h3>Colab Documents</h3> : <></>}
          <div className="collabDocs">
            {collabDocs.map((doc, index) => (
              <Documents
                doc={doc}
                collab={true}
                handleContextMenu={handleContextMenu}
              />
            ))}
          </div>
        </div>
        <div
          className="addNewDoc"
          onClick={() => {
            setNewDocumentName("Document " + (docs.length + 1));
            setShowDialog(true);
          }}
        >
          +
        </div>
      </div>
      {showToast && (
        <div className="toast">
          <span>{toastMessage}</span>
          <button onClick={() => setShowToast(false)}>Close</button>
        </div>
      )}
      {showDialog && (
        <div className="dialog">
          <input
            type="text"
            value={newDocumentName}
            onChange={(e) => setNewDocumentName(e.target.value)}
            placeholder="Enter document name"
          />
          <span style={{ display: "flex" }}>
            <button onClick={handleCreateDocument}>Create</button>
            <button onClick={() => setShowDialog(false)}>Cancel</button>
          </span>
        </div>
      )}

      {showLogoutDialog && (
        <div className="dialog">
          <div>Are you Sure, you want to Logout??</div>
          <br />
          <span style={{ display: "flex" }}>
            <button className="logout-btn" onClick={HandleLogout}>
              Logout
            </button>
            <button onClick={() => setShowLogoutDialog(false)}>Dismiss</button>
          </span>
        </div>
      )}

      {contextMenuPos && (
        <ContextMenu
          posX={contextMenuPos.posX}
          posY={contextMenuPos.posY}
          onOpenInNewTab={handleOpenInNewTab}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}

const Documents = ({ doc, collab, handleContextMenu }) => {
  const navigate = useNavigate();
  return (
    <div
      key={doc._id}
      className="docContainer"
      onClick={() => {
        navigate(`/document/${doc._id}`);
      }}
      onContextMenu={(e) => {
        handleContextMenu(e, doc._id);
      }}
    >
      <div className="docName">{doc.title}</div>
      <div className="info">
        <div className="docTime">{formatTimestamp(doc.updatedAt)}</div>
        <div className="isCollab">{collab && <span> • collab</span>}</div>
      </div>
    </div>
  );
};

const ContextMenu = ({ posX, posY, onOpenInNewTab, onDelete }) => {
  const handleOpenInNewTab = () => {
    onOpenInNewTab();
  };

  const handleDelete = () => {
    onDelete();
  };

  return (
    <div
      className="context-menu-home"
      style={{ top: posY, left: posX }}
      onClick={(e) => e.stopPropagation()}
    >
      <div onClick={handleOpenInNewTab}>Open in new tab</div>
      <div onClick={handleDelete}>Delete</div>
    </div>
  );
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();

  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else {
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
};

export default Home;
