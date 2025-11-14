import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import ReactDOM from "react-dom/client";
import AIChat from "./components/AIChat/AI";
import Footer from "./components/Footer/footer";

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");

  const handleShowAuthModal = (tab = "login") => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  const [showChatbot, setShowChatbot] = useState(false);

// // Nút mở chatbot (có thể đặt ở Header)
// <button onClick={() => setShowChatbot(true)}>Chat với EMT AI</button>

// // Render chatbot
// {showChatbot && (
//   <AIChat isVisible={showChatbot} onClose={() => setShowChatbot(false)} />
// )}
// Chatbot is only available for User, and only opens when button is clicked (see commented code below)
  const outletWithProps = React.cloneElement(<Outlet />, {
    onShowAuthModal: handleShowAuthModal
  });

  return (
    <div className="App">
      <Header 
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        authTab={authTab}
        setAuthTab={setAuthTab}
      />

      <main className="main-content">
        {outletWithProps}
        {/* <button onClick={() => setShowChatbot(true)}>Chat với EMT AI</button>
{showChatbot && (
  <AIChat isVisible={showChatbot} onClose={() => setShowChatbot(false)} /> */}
{/* )} */}
      </main>
      <Footer />
    </div>
  );
}

export default App;