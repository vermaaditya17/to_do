import express from 'express';
import Task from '../models/Task.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all endpoints below

// Get user specific tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create private task
router.post('/', async (req, res) => {
  const { title, checklist } = req.body;
  try {
    const task = new Task({ userId: req.user._id, title, checklist });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { isCompleted, checklist } = req.body;
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (checklist) task.checklist = checklist;
    if (typeof isCompleted === 'boolean') {
      task.isCompleted = isCompleted;
      task.completedAt = isCompleted ? new Date() : null;
    }

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;