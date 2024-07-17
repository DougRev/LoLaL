import { createContext, useReducer } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'REGISTER_SUCCESS':
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
      };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  const register = async (formData) => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    const res = await axios.post('/api/users/register', formData, config);
    dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
  };

  const login = async (formData) => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    const res = await axios.post('/api/users/login', formData, config);
    dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
