import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";  // Make sure the path is correct
import Header from "./components/Header";

import "./styles/themes.css";
import "./App.css";

import Home from "./pages/Home";
import YuGiOhCards from "./pages/YuGiOhCards";
import CardsSearchPage from "./pages/CardsSearchPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

const App = () => {
  return (
    <Router>
      <AuthProvider>  // Wrap everything that requires auth state with AuthProvider
        <Header />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cards" element={<CardsSearchPage />} />
            <Route path="/cards/pokemon" element={<h1>Pokémon Cards</h1>} />
            <Route path="/cards/yugioh" element={<YuGiOhCards />} />
            <Route path="/user" element={<h1>User Page</h1>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
