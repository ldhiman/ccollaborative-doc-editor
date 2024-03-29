import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import DocEditor from "./components/DocEditor";
import PasswordReset from "./components/PasswordReset";
import CollabRequest from "./components/Collab-Request";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/document/:docId" element={<DocEditor />} />
        <Route path="/reset-password/:token" element={<PasswordReset />} />
        <Route path="/collab-request/:token" element={<CollabRequest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
