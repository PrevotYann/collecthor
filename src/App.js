import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";

import "./styles/themes.css";
import "./App.css";

import Home from "./pages/Home";
import YuGiOhCards from "./pages/YuGiOhCards";

const App = () => {
  return (
    <Router>
      <Header />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cards/pokemon" element={<h1>Pokémon Cards</h1>} />
          <Route path="/cards/yugioh" element={<YuGiOhCards />} />
          <Route path="/user" element={<h1>User Page</h1>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
