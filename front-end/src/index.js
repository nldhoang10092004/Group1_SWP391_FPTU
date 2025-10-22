import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import HomePage from './components/Home/HomePage';
import Home from './components/User/Home'; 
import ForgotPass from "./components/Password/Forgotpass";
import ResetPassword from "./components/Password/ResetPassword";
import Profile from "./components/Profile/Profile";
import Dashboard from "./components/Teacher/Dashboard";
import Guide from "./components/Teacher/Guide";
import CreateLesson from "./components/Teacher/CreateLesson";
import WritingPractice from "./components/User/WritingPractice";
import EditLesson from "./components/Teacher/EditLesson";
import Membership from "./components/User/Membership";
import CourseDetail from './components/User/CourseDetail';
import EditCourse from './components/Teacher/EditCourse';
import Flashcard from "./components/User/Flashcard";
import Grammar from "./components/User/Grammar";
import PaymentForm from "./components/User/PaymentForm";
import PaymentSuccessSubscription from "./components/User/PaymentSuccessSubscription";
import CreateEditQuizz from './components/Teacher/CreateEditQuizz';
import CreateEditFlashcard from './components/Teacher/CreateEditFlashcard';
import AdminDashboard  from "./components/Admin/AdminDashboard";
import StartQuiz from "./components/User/StartQuiz";
import FlashcardList from './components/User/FlashcardList';

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? children : <Navigate to="/" replace />; 
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={
          localStorage.getItem("user") ? <Navigate to="/home" replace /> : <HomePage />
        } />
        
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        
        <Route path="writingpractice" element={<WritingPractice />} />
        <Route path="forgotpassword" element={<ForgotPass />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="/teacher/dashboard" element={<Dashboard />} />
        <Route path="guide" element={<Guide />} />
        <Route path="createlesson" element={<CreateLesson />} />
        <Route path="editlesson" element={<EditLesson />} />
        <Route path="membership" element={<Membership />} />
        <Route path="/payment/:id" element={<PaymentForm />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/editcourse/:id" element={<EditCourse />} />
        <Route path="/flashcards" element={<FlashcardList />} />
        <Route path="/flashcards/:setId" element={<Flashcard />} />
        <Route path="grammar" element={<Grammar />} />
        <Route path="payment-success" element={<Pdashboard" element={<AdminDashboard />} />
        <Route path="/quiz/start/:quizId" element={<StartQuiz />} />

        <Route path="profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Route>

    </Routes>
  </BrowserRouter>
);
