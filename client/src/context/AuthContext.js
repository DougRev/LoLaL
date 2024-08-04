import { createContext, useReducer, useEffect, useCallback } from 'react';
import jwt from 'jsonwebtoken';
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
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        loading: false,
        user: action.payload.user,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload.user,
      };
    case 'LOGOUT':
      return {
        ...state,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        kingdom: null,
      };
    case 'UPDATE_KINGDOM':
      return {
        ...state,
        kingdom: action.payload.kingdom,
      };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const initialState = {
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: false,
    loading: true,
    user: null,
    kingdom: null,
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  const setAuthHeaders = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      console.log('Set auth headers with token:', token);
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      console.log('Removed auth headers');
    }
  };

  const storeTokens = (token, refreshToken) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    console.log('Stored tokens:', { token, refreshToken });
  };

  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('No refresh token found, logging out...');
        return dispatch({ type: 'LOGOUT' });
      }

      console.log('Refreshing access token with:', refreshToken);
      const res = await axios.post('/api/users/refresh-token', { token: refreshToken });
      const { token, refreshToken: newRefreshToken } = res.data;
      storeTokens(token, newRefreshToken);
      setAuthHeaders(token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, refreshToken: newRefreshToken, user: state.user } });
    } catch (error) {
      console.error('Error refreshing access token:', error);
      dispatch({ type: 'LOGOUT' });
    }
  }, [state.user]);

  const register = async (formData) => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    try {
      console.log('Registering user with form data:', formData);
      const res = await axios.post('/api/users/register', formData, config);
      const { token, refreshToken } = res.data;
      storeTokens(token, refreshToken);
      setAuthHeaders(token);
      const userRes = await axios.get('/api/users/user', { headers: { 'x-auth-token': token } });
      dispatch({ type: 'REGISTER_SUCCESS', payload: { token, refreshToken, user: userRes.data } });
      fetchKingdom(userRes.data.kingdom._id);
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration. Please try again.');
    }
  };

  const login = async (formData) => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    try {
      console.log('Logging in user with form data:', formData);
      const res = await axios.post('/api/users/login', formData, config);
      const { token, refreshToken } = res.data;
      storeTokens(token, refreshToken);
      setAuthHeaders(token);
      const userRes = await axios.get('/api/users/user', { headers: { 'x-auth-token': token } });
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, refreshToken, user: userRes.data } });
      fetchKingdom(userRes.data.kingdom._id);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const googleLogin = async (token) => {
    try {
      if (token) {
        localStorage.setItem('token', token);
        setAuthHeaders(token);
        const userRes = await axios.get('/api/users/user', { headers: { 'x-auth-token': token } });
        if (userRes.data) {
          const { _id, name, email, role, kingdom, faction } = userRes.data;
          const user = { _id, name, email, role, kingdom, faction };
          dispatch({ type: 'GOOGLE_LOGIN_SUCCESS', payload: { token, refreshToken: state.refreshToken, user } });
  
          if (kingdom && kingdom._id) {
            // Fetch the kingdom only if kingdom data is available
            await fetchKingdom(kingdom._id);
          } else {
            console.warn('User kingdom not found');
          }
        } else {
          console.error('Google login failed: User data is not available.');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        console.error('Google login failed: Token is not available.');
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Google login error:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };
  

  const clearTokens = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    console.log('Cleared tokens from localStorage');
  };

  const fetchKingdom = useCallback(async (kingdomId) => {
    try {
      console.log(`Fetching kingdom with ID: ${kingdomId}`);
      const response = await axios.get(`/api/kingdoms/${kingdomId}`);
      dispatch({ type: 'UPDATE_KINGDOM', payload: { kingdom: response.data } });
      console.log('Fetched kingdom:', response.data);
    } catch (error) {
      console.error('Error fetching kingdom:', error);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
  
    if (token) {
      if (checkTokenExpiration(token)) {
        await refreshAccessToken();
      } else {
        setAuthHeaders(token);
        try {
          const res = await axios.get('/api/users/user');
          console.log('USER HERE:', res.data);
          if (res.data) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: { token, refreshToken, user: res.data } });
            if (res.data.kingdom) {
              fetchKingdom(res.data.kingdom._id);
            }
            if (!res.data.faction) {
              // If the user doesn't have a faction, redirect to select-faction
              window.location.href = '/select-faction';
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          dispatch({ type: 'LOGOUT' });
        }
      }
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, [refreshAccessToken, fetchKingdom]);
  

  const checkTokenExpiration = (token) => {
    if (!token) return true;
    const decodedToken = jwt.decode(token);
    if (!decodedToken || !decodedToken.exp) return true;
    const now = Date.now() / 1000;
    return decodedToken.exp < now;
  };

  const logout = useCallback(async () => {
    try {
      await axios.get('/api/logout', { withCredentials: true });
      clearTokens();
      setAuthHeaders(null);
      dispatch({ type: 'LOGOUT' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  useEffect(() => {
    if (state.loading) {
      fetchUser();
    }
  }, [fetchUser, state.loading]);

  useEffect(() => {
    console.log('Auth state updated:', state);
  }, [state]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      googleLogin(token);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, register, login, googleLogin, logout, fetchUser, fetchKingdom }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
