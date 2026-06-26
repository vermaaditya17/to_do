import express from 'express';
import Task from '../models/Task.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/:period', async (req, res) => {
  const { period } = req.params;
  let groupByFormat = "%Y-%m-%d";
  let matchQuery = { userId: req.user._id, isCompleted: true };
  const now = new Date();

  if (period === 'daily') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    matchQuery.completedAt = { $gte: sevenDaysAgo };
    groupByFormat = "%a"; 
  } else if (period === 'monthly') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    matchQuery.completedAt = { $gte: startOfYear };
    groupByFormat = "%b"; 
  } else if (period === 'yearly') {
    groupByFormat = "%Y";
  }

  try {
    const stats = await Task.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: groupByFormat, date: "$completedAt" } },
          completedCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedData = stats.map(item => ({
      label: item._id,
      completed: item.completedCount
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;