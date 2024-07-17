import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Form.css';

const RegisterForm = () => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    await register(formData);
    navigate('/dashboard');
  };

  return (
    <form className="form" onSubmit={onSubmit}>
      <h2>Register</h2>
      <input type="text" name="name" value={formData.name} onChange={onChange} required placeholder="Name" />
      <input type="email" name="email" value={formData.email} onChange={onChange} required placeholder="Email" />
      <input type="password" name="password" value={formData.password} onChange={onChange} required placeholder="Password" />
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;
