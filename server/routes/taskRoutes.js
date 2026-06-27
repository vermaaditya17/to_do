import express from 'express';
import Task from '../models/Task.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Secure all endpoints below with protect middleware
router.use(protect);

// 🔍 DEBUG SYSTEM: Helper to log requests safely
const logDebug = (route, req, extra = {}) => {
  console.log(`\n=== 🩺 DEBUG [${route}] ===`);
  console.log(`▶ User Object exists?:`, !!req.user);
  console.log(`▶ User ID:`, req.user ? req.user._id : '❌ MISSING (NULL)');
  if (Object.keys(extra).length > 0) {
    console.log(`▶ Additional Data:`, JSON.stringify(extra, null, 2));
  }
  console.log(`=============================\n`);
};

// 1. Get user specific tasks
router.get('/', async (req, res) => {
  try {
    logDebug('GET /tasks', req);
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Debug Error: req.user._id is missing in route' });
    }

    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("❌ GET Tasks Failure:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// 2. Create private task
router.post('/', async (req, res) => {
  const { title, checklist } = req.body;
  try {
    logDebug('POST /tasks', req, { title, checklistLength: checklist?.length });

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Debug Error: req.user._id is missing during creation' });
    }

    const task = new Task({ 
      userId: req.user._id, 
      title: title?.trim(), 
      checklist: checklist || [] 
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("❌ POST Task Failure:", error.message);
    res.status(400).json({ message: error.message });
  }
});

// 3. Update task
router.put('/:id', async (req, res) => {
  try {
    const { isCompleted, checklist } = req.body;
    logDebug('PUT /tasks/:id', req, { targetId: req.params.id, isCompleted });

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Debug Error: req.user._id is missing during update' });
    }

    // Failsafe Find
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      console.log(`⚠️ Warning: Task with ID ${req.params.id} not found for User ${req.user._id}`);
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    if (checklist) task.checklist = checklist;
    
    if (typeof isCompleted === 'boolean') {
      task.isCompleted = isCompleted;
      task.completedAt = isCompleted ? new Date() : null;
    }

    await task.save();
    res.json(task);
  } catch (error) {
    console.error("❌ PUT Task Failure:", error.message);
    res.status(400).json({ message: error.message });
  }
});

// 4. Delete task
router.delete('/:id', async (req, res) => {
  try {
    logDebug('DELETE /tasks/:id', req, { targetId: req.params.id });

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Debug Error: req.user._id is missing during deletion' });
    }

    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }
    
    res.json({ message: 'Task removed successfully' });
  } catch (error) {
    console.error("❌ DELETE Task Failure:", error.message);
    res.status(500).json({ message: error.message });
  }
});

export default router;