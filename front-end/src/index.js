import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import HomePage from './components/Home/HomePage';
import Home from './components/Home/Home'; 
import User from './components/User/User';
import Login from './components/Auth/Login';
import ForgotPass from "./components/Password/Forgotpass";
import ResetPassword from "./components/Password/ResetPassword";
import Profile from "./components/Profile/Profile"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<HomePage />} />   
        <Route path="home" element={<Home />} /> 
        <Route path="users" element={<User />} />
        <Route path="forgotpassword" element={<ForgotPass />} />
<Route path="resetpassword" element={<ResetPassword />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/login" element={<Login />} />
    </Routes>
  </BrowserRouter>
);
