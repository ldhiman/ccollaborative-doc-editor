import axios from "axios";
import React, { useState } from "react";
import "./PasswordReset.css";
import { useParams } from "react-router-dom";

const PasswordReset = () => {
  const [message, setMessage] = useState("Password Reset");
  const { token } = useParams();

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("Reseting Password....");
    axios
      .post("https://ccollaborative-doc-editor-api.vercel.app/auth/resetPassword", {
        token,
        newPassword: e.target[0].value,
      })
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        setMessage(error.response.data.message || error.message);
      });
  };

  return (
    <div className="password-reset-container">
      <h2>{message}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" required />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default PasswordReset;
