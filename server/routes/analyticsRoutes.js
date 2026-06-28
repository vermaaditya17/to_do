import express from 'express';
import Task from '../models/Task.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/:period', async (req, res) => {
  const { period } = req.params;
  let groupByFormat = "%Y-%m-%d";
  
  // 1. केवल उसी यूजर के पूरे हुए टास्क ढूंढें जिसके पास valid completedAt डेट हो
  let matchQuery = { 
    userId: req.user._id, 
    isCompleted: true,
    completedAt: { $ne: null, $exists: true } // 🔴 Failsafe: चेक करें कि डेट मौजूद हो
  };
  
  const now = new Date();

  if (period === 'daily') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    matchQuery.completedAt = { $gte: sevenDaysAgo, $ne: null };
    groupByFormat = "%a"; // Mon, Tue...
  } else if (period === 'monthly') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    matchQuery.completedAt = { $gte: startOfYear, $ne: null };
    groupByFormat = "%b"; // Jan, Feb...
  } else if (period === 'yearly') {
    groupByFormat = "%Y"; // 2026...
  }

  try {
    // 2. MongoDB Aggregation Execution
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

    // 3. Recharts के अनुकूल डेटा फॉर्मेट करना
    const formattedData = stats.map(item => ({
      label: item._id || "Unknown",
      completed: item.completedCount || 0
    }));

    res.json(formattedData);
  } catch (error) {
    // 4. अगर फिर भी एरर आए, तो बैकएंड कंसोल में साफ़ प्रिंट करें कि दिक्कत क्या है
    console.error("❌ Aggregation Core Failure:", error.message);
    res.status(500).json({ message: "Internal server aggregation error", error: error.message });
  }
});

export default router;