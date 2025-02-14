import mongoose from 'mongoose';

// Define the schema for active users
const activeUsersSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  sessionId: { type: String, required: true },
  count: { type: Number, default: 1, min: 0 },
  lastUpdated: { type: Date, default: Date.now },
  userAgent: { type: String },
  ipAddress: { type: String }
});

// Remove any existing indexes to prevent conflicts
activeUsersSchema.index({ roomId: 1 }, { unique: false });

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
const ActiveUsers = mongoose.models.ActiveUsers || mongoose.model('ActiveUsers', activeUsersSchema);

// Drop existing indexes and recreate them
async function ensureIndexes() {
  try {
    if (mongoose.connection.readyState === 1) { // If connected
      await ActiveUsers.collection.dropIndexes();
      await ActiveUsers.syncIndexes();
      console.log('ActiveUsers indexes recreated successfully');
    }
  } catch (error) {
    console.error('Error recreating indexes:', error);
  }
}

// Call ensureIndexes when the model is first created
ensureIndexes();

export { ActiveUsers }; 