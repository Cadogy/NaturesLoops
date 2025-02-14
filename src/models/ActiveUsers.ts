import mongoose from 'mongoose';

// Define the schema for active users
const activeUsersSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  sessionId: { type: String, required: true },
  count: { type: Number, default: 1, min: 0 },
  lastUpdated: { type: Date, default: Date.now }, // Remove expires from here
  userAgent: { type: String },
  ipAddress: { type: String }
});

// Create compound index for roomId and sessionId
activeUsersSchema.index({ roomId: 1, sessionId: 1 }, { unique: true });

// Single TTL index for automatic cleanup after 5 minutes of inactivity
activeUsersSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 300 });

// Add middleware to ensure count never goes below 0
activeUsersSchema.pre('save', function(next) {
  if (this.count < 0) {
    this.count = 0;
  }
  next();
});

// Export the model
export const ActiveUsers = mongoose.models.ActiveUsers || mongoose.model('ActiveUsers', activeUsersSchema); 