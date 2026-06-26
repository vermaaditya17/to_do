import React, { useState } from 'react';
import axios from 'axios';

export default function Signup({ setAuth, toggleView }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://to-do-dmhr.onrender.com/api/auth/signup', { name, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setAuth(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm">
      <h2 className="text-xl font-black text-zinc-900 mb-6">Create Account</h2>
      {error && <p className="text-xs text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500" required
        />
        <input 
          type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500" required
        />
        <input 
          type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500" required
        />
        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm">
          Sign Up
        </button>
      </form>
      <p className="text-xs text-zinc-400 mt-6 text-center">
        Have an account? <span onClick={toggleView} className="text-purple-600 font-semibold cursor-pointer hover:underline">Log in instead</span>
      </p>
    </div>
  );
}