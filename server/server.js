import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);

const allowedOrigins = [
  'http://localhost:5173',
  'https://to-do-umber-chi.vercel.app/'

]

app.use(cors({
  origin: function (origin, callback) {
    // बिना ओरिजिन वाली रिक्वेस्ट्स (जैसे Postman या मोबाइल ऐप्स) को अलाउ करने के लिए !origin
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: This origin is not allowed by live server.'));
    }
  },
  credentials: true
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend Active on Port ${PORT}`));