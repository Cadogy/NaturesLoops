import mongoose from 'mongoose';

// Define the schema for active users
const activeUsersSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  count: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

// Create indexes
activeUsersSchema.index({ roomId: 1 }, { unique: true });

// Export the model
export const ActiveUsers = mongoose.models.ActiveUsers || mongoose.model('ActiveUsers', activeUsersSchema); 