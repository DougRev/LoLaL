import { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'REGISTER_SUCCESS':
    case 'LOGIN_SUCCESS':
    case 'GOOGLE_LOGIN_SUCCESS':
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
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
    token: null,
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

  const googleLogin = async () => {
    const res = await axios.get('/api/checkAuth', { withCredentials: true });
    if (res.data.token) {
      dispatch({ type: 'GOOGLE_LOGIN_SUCCESS', payload: { token: res.data.token } });
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  };
  const logout = async () => {
    await axios.get('/api/logout', { withCredentials: true });
    dispatch({ type: 'LOGOUT' });
    window.location.href = '/'; 
  };
  

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/api/checkAuth', { withCredentials: true });
        if (res.data.token) {
          dispatch({ type: 'GOOGLE_LOGIN_SUCCESS', payload: { token: res.data.token } });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (err) {
        dispatch({ type: 'LOGOUT' });
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, register, login, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
