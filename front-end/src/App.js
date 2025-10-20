import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import "./components/AIChat/AI";
import Footer from "./components/Footer/footer";

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");

  const handleShowAuthModal = (tab = "login") => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };
 useEffect(() => {
    const chatbotRoot = document.createElement("div");
    chatbotRoot.id = "emt-ai-chatbot-root";
    document.body.appendChild(chatbotRoot);

    if (window.EMTChatbot) {
      window.EMTChatbot.toggle();
      window.EMTChatbot.toggle();
    }

    return () => {
      const oldBot = document.getElementById("emt-ai-chatbot-root");
      if (oldBot) oldBot.remove();
    };
  }, []);
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
      </main>
      <Footer />
    </div>
  );
}

export default App;