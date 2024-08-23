import { createContext, useReducer, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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

  // Function to refresh Google OAuth token
  const refreshGoogleToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return dispatch({ type: 'LOGOUT' });
      }

      const res = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });

      const { access_token, refresh_token } = res.data;
      storeTokens(access_token, refresh_token || refreshToken);
      setAuthHeaders(access_token);
      dispatch({
        type: 'GOOGLE_LOGIN_SUCCESS',
        payload: { token: access_token, refreshToken: refresh_token || refreshToken, user: state.user },
      });
    } catch (error) {
      console.error('Error refreshing Google token:', error);
      dispatch({ type: 'LOGOUT' });
    }
  }, [state.user]);

  const refreshAccessToken = useCallback(async () => {
    if (state.user?.isGoogleUser) {
      await refreshGoogleToken();
    } else {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          return dispatch({ type: 'LOGOUT' });
        }

        const res = await axios.post('/api/users/refresh-token', { token: refreshToken });
        const { token, refreshToken: newRefreshToken } = res.data;
        storeTokens(token, newRefreshToken);
        setAuthHeaders(token);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token, refreshToken: newRefreshToken, user: state.user },
        });
      } catch (error) {
        console.error('Error refreshing token:', error);
        dispatch({ type: 'LOGOUT' });
      }
    }
  }, [state.user, refreshGoogleToken]);
  
  const register = async (formData) => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    try {
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
          const completeUser = {
            ...userRes.data,
            stats: userRes.data.stats || { total: { attack: 10, defense: 10, speed: 5, health: 100 } },
            runeCollection: userRes.data.runeCollection || {
              common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
            },
          };
          dispatch({ type: 'GOOGLE_LOGIN_SUCCESS', payload: { token, refreshToken: state.refreshToken, user: completeUser } });
  
          if (completeUser.kingdom && completeUser.kingdom._id) {
            await fetchKingdom(completeUser.kingdom._id);
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
      const response = await axios.get(`/api/kingdoms/${kingdomId}`);
      dispatch({ type: 'UPDATE_KINGDOM', payload: { kingdom: response.data } });
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
          if (res.data) {
            const completeUser = {
              ...res.data,
              stats: res.data.stats || { total: { attack: 0, defense: 0, speed: 0, health: 100 } },
              runeCollection: res.data.runeCollection || {
                common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
              },
              highestDungeon: res.data.highestDungeon || 0,
              highestRegion: res.data.highestRegion || 0,
            };
            dispatch({ type: 'LOGIN_SUCCESS', payload: { token, refreshToken, user: completeUser } });
            if (completeUser.kingdom) {
              fetchKingdom(completeUser.kingdom._id);
            }
            if (!completeUser.faction && window.location.pathname !== '/select-faction') {
              navigate('/select-faction');
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
  }, [refreshAccessToken, fetchKingdom, navigate]);

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
      setTimeout(() => {
        window.location.href = '/';
      }, 200);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  // New response interceptor for handling token expiration
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && error.response.data.expired) {
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              return dispatch({ type: 'LOGOUT' });
            }

            const res = await axios.post('/api/users/refresh-token', { token: refreshToken });
            const { token: newAccessToken, refreshToken: newRefreshToken } = res.data;

            localStorage.setItem('token', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            axios.defaults.headers.common['x-auth-token'] = newAccessToken;
            originalRequest.headers['x-auth-token'] = newAccessToken;

            return axios(originalRequest);
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            dispatch({ type: 'LOGOUT' });
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [dispatch]);

  useEffect(() => {
    if (state.loading) {
      fetchUser();
    }
  }, [fetchUser, state.loading]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      googleLogin(token);
    }
  }, []);

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(async (config) => {
      const token = localStorage.getItem('token');
      if (checkTokenExpiration(token)) {
        await refreshAccessToken();
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider value={{ ...state, register, login, googleLogin, logout, fetchUser, fetchKingdom }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
