import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Form.css';

const LoginForm = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    await login(formData);
    navigate('/dashboard');
  };

  return (
    <form className="form" onSubmit={onSubmit}>
      <h2>Login</h2>
      <input type="email" name="email" value={formData.email} onChange={onChange} required placeholder="Email" />
      <input type="password" name="password" value={formData.password} onChange={onChange} required placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;
