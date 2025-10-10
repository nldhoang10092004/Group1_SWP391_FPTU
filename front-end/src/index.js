import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import HomePage from './components/Home/HomePage';
import Home from './components/Home/Home'; 
import User from './components/User/User';
import ForgotPass from "./components/Password/Forgotpass";
import ResetPassword from "./components/Password/ResetPassword";
import Profile from "./components/Profile/Profile";
import StudentDashboard from "./components/Student/StudentDashboard";
import StudentCourses from "./components/Student/StudentCourses";
import StudentCourseDetail from "./components/Student/StudentCourseDetail";
import TeacherDashboard from "./components/Teacher/TeacherDashboard";
import TeacherCourseManagement from "./components/Teacher/TeacherCourseManagement";

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
        
        {/* Student Routes */}
        <Route path="student/dashboard" element={<StudentDashboard />} />
        <Route path="student/courses" element={<StudentCourses />} />
        <Route path="student/courses/:courseId" element={<StudentCourseDetail />} />
        
        {/* Teacher Routes */}
        <Route path="teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="teacher/courses/manage" element={<TeacherCourseManagement />} />
      </Route>

    </Routes>
  </BrowserRouter>
);
