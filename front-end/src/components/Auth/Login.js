import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.scss";
import { getImageListItemBarUtilityClass } from "@mui/material/ImageListItemBar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    axios.post("http://localhost:3003/api/auth/login", {
  email,
  password
}, config)

      .then((response) => {
        setMessage("You're logged in");
        navigate("/"); 
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage("Login failed");
      });
  };

  return (
    <div className="login-container">
      <div className="header col-4">
        Don't have an account yet?
      </div>

      <div className="content-form col-4 mx-auto">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <span>Forgot password?</span>

        <div>
          <button onClick={handleSubmit}>Login</button>
        </div>
        <div className="text-center">
            <span onClick={() => { navigate('/')}}>
                &#60;&#60; Go to Hpmepage
            </span>
        </div>
        {message && <p className="success">{message}</p>}
        {errorMessage && <p className="error">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default Login;
