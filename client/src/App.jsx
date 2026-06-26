import React, { useState, useEffect } from 'react';
import TaskList from './components/TaskList.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import { Sparkles, LogOut } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.stringify(localStorage.getItem('user')) ? JSON.parse(localStorage.getItem('user')) : null);
  const [view, setView] = useState('login'); // login | signup

  const setAuth = (jwtToken, userProfile) => {
    setToken(jwtToken);
    setUser(userProfile);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setView('login');
  };

  if (!token) {
    return view === 'login' 
      ? <Login setAuth={setAuth} toggleView={() => setView('signup')} /> 
      : <Signup setAuth={setAuth} toggleView={() => setView('login')} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-800 antialiased selection:bg-purple-100">
      <div className="h-1.5 w-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400" />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <header className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200/60 pb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white border border-zinc-200/80 px-3 py-1 rounded-full text-[11px] font-semibold text-purple-600 shadow-sm mb-3">
              <Sparkles size={11} /> Dashboard Active
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-950">
              {user?.name ? `${user.name}'s Space.` : "Workspace."}
            </h1>
            <p className="text-xs text-zinc-400 mt-1.5 font-medium">Isolate your tasks, evaluate metrics.</p>
          </div>
          
          <button onClick={handleLogout} className="flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200/80 px-4 py-2 rounded-xl text-xs font-bold text-red-500 shadow-sm transition-all self-center sm:self-auto">
            <LogOut size={14} /> Log Out
          </button>
        </header>
        
        <main><TaskList token={token} /></main>
      </div>
    </div>
  );
}