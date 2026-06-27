import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Trash2, Plus, X, List, Search, Flame } from 'lucide-react';
import AnalyticsCharts from './AnalyticsChart';

export default function TaskList({ token }) {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [subtasksList, setSubtasksList] = useState([]);
  const [currentSubtask, setCurrentSubtask] = useState('');
  const [refreshAnalytics, setRefreshAnalytics] = useState(0);
  const [streak, setStreak] = useState(0);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchTasks = async () => {
    try {
      const res = await axios.get('https://to-do-dmhr.onrender.com/api/tasks', config);
      setTasks(res.data);
      calculateStreak(res.data);
    } catch (err) { console.error(err); }
  };

  const calculateStreak = (allTasks) => {
    const completedDates = allTasks
      .filter(t => t.isCompleted && t.completedAt)
      .map(t => new Date(t.completedAt).toDateString());
    
    const uniqueDates = [...new Set(completedDates)];
    let currentStreak = 0;
    let today = new Date();
    
    while (uniqueDates.includes(today.toDateString())) {
      currentStreak++;
      today.setDate(today.getDate() - 1);
    }
    setStreak(currentStreak);
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [refreshAnalytics, token]);

  const addSubtaskToDraft = () => {
    if (!currentSubtask.trim()) return;
    setSubtasksList([...subtasksList, { text: currentSubtask.trim(), isDone: false }]);
    setCurrentSubtask('');
  };
const handleAddTask = async (e) => {
  e.preventDefault();
  
  
  if (!newTitle.trim()) return;

  try {
    
    const activeToken = token || localStorage.getItem('token');
    const requestConfig = { 
      headers: { Authorization: `Bearer ${activeToken}` } 
    };

    const payload = { 
      title: newTitle.trim(), 
      checklist: subtasksList.length > 0 ? subtasksList : [] 
    };

    await axios.post('http://localhost:5000/api/tasks', payload, requestConfig);
    
    setNewTitle('');
    setSubtasksList([]);
    fetchTasks();
    setRefreshAnalytics(p => p + 1);
  } catch (err) {
    console.error("Task Add Error Details:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Failed to create task blueprint. Check server console.");
  }
};

  const toggleTask = async (id, currentStatus) => {
    await axios.put(`https://to-do-dmhr.onrender.com/api/tasks/${id}`, { isCompleted: !currentStatus }, config);
    fetchTasks();
    setRefreshAnalytics(p => p + 1);
  };

  const toggleSubtask = async (taskId, subtaskIndex) => {
    const task = tasks.find(t => t._id === taskId);
    const updatedChecklist = [...task.checklist];
    updatedChecklist[subtaskIndex].isDone = !updatedChecklist[subtaskIndex].isDone;
    await axios.put(`https://to-do-dmhr.onrender.com/api/tasks/${taskId}`, { checklist: updatedChecklist }, config);
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(`https://to-do-dmhr.onrender.com/api/tasks/${id}`, config);
    fetchTasks();
    setRefreshAnalytics(p => p + 1);
  };

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        
        {/* Search Bar & Streak Counter */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-zinc-200/80 p-4 rounded-xl shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3.5 text-zinc-400" size={16} />
            <input 
              type="text" placeholder="Instant smart search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-2 rounded-xl text-orange-600 text-xs font-bold">
            <Flame size={16} className="fill-orange-500 animate-pulse" /> Streak: {streak} Days
          </div>
        </div>

        {/* Form Workspace */}
        <form onSubmit={handleAddTask} className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm space-y-4">
          <input
            type="text" placeholder="What needs to be done today?" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-800 text-sm focus:outline-none focus:border-purple-500 focus:bg-white font-medium"
          />
          <div className="flex gap-2">
            <input
              type="text" placeholder="Add custom checklist item..." value={currentSubtask} onChange={(e) => setCurrentSubtask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtaskToDraft())}
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-400 focus:bg-white"
            />
            <button type="button" onClick={addSubtaskToDraft} className="px-4 bg-zinc-100 text-zinc-600 text-xs font-semibold rounded-xl border border-zinc-200">Insert</button>
          </div>
          {subtasksList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {subtasksList.map((st, idx) => (
                <span key={idx} className="bg-purple-50 border border-purple-100 text-purple-700 text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                  {st.text} <X size={12} className="cursor-pointer" onClick={() => setSubtasksList(subtasksList.filter((_, i) => i !== idx))} />
                </span>
              ))}
            </div>
          )}
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm">
            <Plus size={15} strokeWidth={2.5} /> Save Blueprint
          </button>
        </form>

        {/* Task Log Container */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 pl-1 mb-2"><List size={13} className="text-purple-500" /> Task Log</h4>
          <AnimatePresence>
            {filteredTasks.map(task => (
              <motion.div 
                key={task._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={`border rounded-2xl p-4 space-y-3 ${task.isCompleted ? 'bg-zinc-50 opacity-50' : 'bg-white border-zinc-200 shadow-sm'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleTask(task._id, task.isCompleted)}>
                    {task.isCompleted ? <CheckCircle2 className="text-purple-600 fill-purple-50" size={20} /> : <Circle className="text-zinc-300" size={20} />}
                    <span className={`text-sm font-semibold ${task.isCompleted ? 'line-through text-zinc-400' : 'text-zinc-700'}`}>{task.title}</span>
                  </div>
                  <button onClick={() => deleteTask(task._id)} className="text-zinc-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>

                {task.checklist?.length > 0 && (
                  <div className="pl-8 flex flex-col gap-2 border-t border-zinc-100 pt-3">
                    {task.checklist.map((item, index) => (
                      <div key={item._id} className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer" onClick={() => toggleSubtask(task._id, index)}>
                        {item.isDone ? <CheckCircle2 className="text-purple-600" size={14} /> : <Circle className="text-zinc-300" size={14} />}
                        <span className={item.isDone ? 'line-through text-zinc-400' : ''}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
      <div className="lg:col-span-1 lg:sticky lg:top-6">
        <AnalyticsCharts token={token} key={refreshAnalytics} />
      </div>
    </div>
  );
}