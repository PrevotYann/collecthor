import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/token`,
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      // Save user data to localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({ username, accessToken: response.data.access_token })
      );
      setUser({ username, accessToken: response.data.access_token });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    // Remove user data from localStorage
    localStorage.removeItem("user");
    setUser(null);
  };

  const register = async (username, password, email) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/users/register`, {
        username,
        password,
        email,
      });
      // Automatically log in users after registration
      await login(username, password);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  // Load the user from localStorage when the component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
