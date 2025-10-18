import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");

  const handleShowAuthModal = (tab = "login") => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

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
    </div>
  );
}

export default App;