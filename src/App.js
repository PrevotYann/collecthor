import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "./styles/themes.css";
import "./App.css";

import Home from "./pages/Home";
import YuGiOhCards from "./pages/YuGiOhCards";
import CardsSearchPage from "./pages/CardsSearchPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import User from "./pages/User";
import PokemonCards from "./pages/PokemonCards";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cards" element={<CardsSearchPage />} />
            <Route path="/cards/pokemon" element={<PokemonCards />} />
            <Route path="/cards/yugioh" element={<YuGiOhCards />} />
            <Route path="/user" element={<User />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </AuthProvider>
      <ToastContainer />
    </Router>
  );
};

export default App;
