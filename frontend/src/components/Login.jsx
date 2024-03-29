import React, { useState, useEffect } from "react";
import "./Login.css";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import { resetPassword, handleLogin, handleRegister } from "../js/auth.js";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    const cookies = new Cookies();
    const verifyUser = async () => {
      const jwt = cookies.get("token");
      if (jwt) {
        navigate("/home");
      }
    };
    verifyUser();
  }, [navigate]);

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

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handlePasswordReset = () => {
    setIsPasswordReset(true);
  };

  const ResetPassword = () => {
    setIsLoading(true);

    resetPassword(email)
      .then((res) => {
        showToast("Password reset request sent!");
      })
      .catch((error) => {
        showToast("Some Error Occurred!!");
        console.error("There was a problem with the axios operation:", error);
      })
      .finally(() => {
        setIsLoading(false);
        setIsPasswordReset(false);
      });
  };

  const HandleRegister = () => {
    setIsLoading(true);
    handleRegister(email, password)
      .then((res) => {
        showToast("Registraion Succesfull");
        navigate("/home");
      })
      .catch((error) => {
        showToast(error);
        console.error("There was a problem with the axios operation:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const HandleLogin = () => {
    setIsLoading(true);

    handleLogin(email, password)
      .then((res) => {
        showToast("successfully logged in!!");
        navigate("/home");
      })
      .catch((error) => {
        showToast(error);
        console.error("There was a problem with the axios operation:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleType = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#e5e8f1",
        display: "flex",
        padding: "8px 16px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="innerDiv">
        <div className="part1">
          <img
            src="https://i.ibb.co/VV1bSgH/image-processing20200519-12057-4vw09x-removebg-preview.png"
            alt="login"
          />
        </div>
        <div className="part2">
          {isPasswordReset ? (
            <>
              <div className="greeting">Reset Password</div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                autoComplete="on"
                onChange={handleEmailChange}
              />
              <button onClick={ResetPassword}>Reset Password</button>
            </>
          ) : isLogin ? (
            <>
              <div className="greeting">Hello Again!!</div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                autoComplete="on"
                onChange={handleEmailChange}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                autoComplete="on"
                onChange={handlePasswordChange}
              />
              <button onClick={HandleLogin}>Login</button>
              <span onClick={handlePasswordReset}>Forgot Password?</span>
              <span onClick={handleType} className="changeLink">
                Not a member? <span>Register Here</span>
              </span>
            </>
          ) : (
            <>
              <div className="greeting">Welcome!!</div>
              <input
                type="name"
                placeholder="Name"
                value={name}
                onChange={handleNameChange}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
              />
              <button onClick={HandleRegister}>Register</button>
              <span onClick={handleType} className="changeLink">
                Already have an account? <span>Login Here</span>
              </span>
            </>
          )}
        </div>
        {isLoading && (
          <>
            <div id="loader">
              <div className="inner"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
