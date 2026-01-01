import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  // 1-O'ZGARISH: Variable nomini 'user' qildik (currentUser emas)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [loading, setLoading] = useState(false);
  const API_URL = 'http://localhost:5000/api';

  // Tokenni har doim headerga qo'shib qo'yish
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = token;
    }
  }, []);

  // --- LOGIN ---
  const login = async (phone, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/login`, { phone, password });
      const { user: userData, token } = res.data;
      
      // 2-O'ZGARISH: Saqlash
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      axios.defaults.headers.common['Authorization'] = token;

      setUser(userData); // State yangilanadi
      setLoading(false);
      return { success: true, role: userData.role }; 

    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || "Server bilan aloqa yo'q!";
      return { success: false, message: message };
    }
  };

  // --- LOGOUT ---
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = "/login";
  };

  // --- REGISTER ---
  const registerUser = async (userData) => {
    try {
        await axios.post(`${API_URL}/register`, userData);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
  };

  return (
    <DataContext.Provider value={{ 
      user, // <--- MUHIM: Bu yerda 'user' nomi bilan uzatilyapti
      login, 
      logout,
      registerUser,
      loading
    }}>
      {children}
    </DataContext.Provider>
  );
};