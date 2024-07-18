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
        user: action.payload.user,
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
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  const register = async (formData) => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    try {
      const res = await axios.post('/api/users/register', formData, config);
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      const userRes = await axios.get('/api/users/user', { headers: { 'x-auth-token': res.data.token } });
      console.log('User registered:', userRes.data);
      dispatch({ type: 'REGISTER_SUCCESS', payload: { token: res.data.token, user: userRes.data } });
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const login = async (formData) => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    try {
      const res = await axios.post('/api/users/login', formData, config);
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      const userRes = await axios.get('/api/users/user', { headers: { 'x-auth-token': res.data.token } });
      console.log('User logged in:', userRes.data);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token: res.data.token, user: userRes.data } });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const googleLogin = async (token) => {
    try {
      if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['x-auth-token'] = token;
        const userRes = await axios.get('/api/users/user', { headers: { 'x-auth-token': token } });
        console.log('getUser response:', userRes.data);
        dispatch({ type: 'GOOGLE_LOGIN_SUCCESS', payload: { token, user: userRes.data } });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Google login error:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const logout = async () => {
    try {
      await axios.get('/api/logout', { withCredentials: true });
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['x-auth-token'];
      dispatch({ type: 'LOGOUT' });
      window.location.href = '/'; 
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
        try {
          const res = await axios.get('/api/users/user');
          console.log('fetchUser response:', res.data);
          if (res.data) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user: res.data } });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      googleLogin(token);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, register, login, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
