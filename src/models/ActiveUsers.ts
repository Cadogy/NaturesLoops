import mongoose from 'mongoose';

// Define the schema for active users
const activeUsersSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  sessionId: { type: String, required: true },
  count: { type: Number, default: 1 },
  lastUpdated: { type: Date, default: Date.now },
  userAgent: { type: String },
  ipAddress: { type: String }
});

// Create compound index for roomId and sessionId
activeUsersSchema.index({ roomId: 1, sessionId: 1 }, { unique: true });

// Create index for lastUpdated to help with cleanup queries
activeUsersSchema.index({ lastUpdated: 1 });

// Add middleware to ensure count never goes below 0
activeUsersSchema.pre('save', function(next) {
  if (this.count < 0) {
    this.count = 0;
  }
  next();
});

// Export the model
export const ActiveUsers = mongoose.models.ActiveUsers || mongoose.model('ActiveUsers', activeUsersSchema); 