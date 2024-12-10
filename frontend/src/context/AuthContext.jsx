import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jwtDecode } from "jwt-decode"
import { useNavigate } from 'react-router-dom';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("dotoken"));
  const [defaultToken, setDefaultToken] = useState(import.meta.env.VITE_API_SECRET_KEY);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalPermissions, setGlobalPermissions] = useState([])
  const [globalRoles, setGlobalRoles] = useState([])
  const navigate = useNavigate()
  const [homePage, setHomePage] = useState('')
  const [tableDisplayName, setTableDisplayName] = useState('Load Management')
  const [formDisplayName, setFormDisplayName] = useState('Load Entry')
  const [statusFilter, setStatusFilter] = useState([])

  useEffect(() => {
    const storedToken = localStorage.getItem("dotoken");
    if (storedToken) {
      validateToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const decoded = jwtDecode(token);
      setGlobalPermissions(decoded['permissions'])
      setGlobalRoles(decoded['roles'])
      setUser(decoded)
      // setHomePage(decoded['homePageRoute'])
      // setTableDisplayName(decoded['tableDisplayName'])
      // setFormDisplayName(decoded['formDisplayName'])
      // setStatusFilter(decoded['statusToBeFiltered'])
      console.log(JSON.stringify(decoded, null, 2));

      setToken(token);
      setLoading(false);
    } catch (error) {
      console.log(error)
      logout();
      navigate('/')
      setLoading(false);
    }
  };

  const login = (newToken) => {
    localStorage.setItem("dotoken", newToken);
    validateToken(newToken);
    navigate(homePage)
  };

  const logout = () => {
    localStorage.removeItem("dotoken");
    setToken(null);
    setUser(null);
    toast.success('Logout Successful!')
    navigate('/')
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading, validateToken, globalPermissions, globalRoles, defaultToken, homePage, tableDisplayName, formDisplayName, statusFilter }}>
      {children}
    </AuthContext.Provider>
  );
};