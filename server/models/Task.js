import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  checklist: [{
    text: { type: String, required: true },
    isDone: { type: Boolean, default: false }
  }]
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;