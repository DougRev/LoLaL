import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
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
    <div>
      <h1>Register</h1>
      <form onSubmit={onSubmit}>
        <input type="text" name="name" value={formData.name} onChange={onChange} required placeholder="Name" />
        <input type="email" name="email" value={formData.email} onChange={onChange} required placeholder="Email" />
        <input type="password" name="password" value={formData.password} onChange={onChange} required placeholder="Password" />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
