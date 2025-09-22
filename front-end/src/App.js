import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header/Header";


function App() {
  return (
    <div className="App">
      <Header />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
