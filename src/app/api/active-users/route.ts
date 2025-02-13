import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ActiveUsers } from '@/models/ActiveUsers';

export const dynamic = 'force-dynamic';

// Cleanup stale sessions (older than 5 minutes)
async function cleanupStaleSessions() {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await ActiveUsers.deleteMany({
      lastUpdated: { $lt: fiveMinutesAgo }
    });
  } catch (error) {
    console.error('Error cleaning up stale sessions:', error);
  }
}

// GET total active users
export async function GET() {
  try {
    await connectDB();
    
    // Clean up stale sessions before counting
    await cleanupStaleSessions();
    
    const activeUsers = await ActiveUsers.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$count' }
        }
      }
    ]);
    
    const total = activeUsers[0]?.total || 0;
    return NextResponse.json({ 
      total,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching active users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active users' }, 
      { status: 500 }
    );
  }
}

// POST to update room count
export async function POST(request: Request) {
  try {
    const { roomId, increment, sessionId } = await request.json();
    
    if (!roomId || typeof increment !== 'number' || !sessionId) {
      return NextResponse.json(
        { error: 'Invalid request body. Required: roomId, increment, sessionId' },
        { status: 400 }
      );
    }

    await connectDB();

    // Clean up stale sessions
    await cleanupStaleSessions();

    // Update or create the room count with session tracking
    const result = await ActiveUsers.findOneAndUpdate(
      { roomId, sessionId },
      {
        $inc: { count: increment },
        $set: { 
          lastUpdated: new Date(),
          sessionId: sessionId
        }
      },
      {
        new: true,
        upsert: true
      }
    );

    // If count is 0 or negative, remove the record
    if (result.count <= 0) {
      await ActiveUsers.deleteOne({ roomId, sessionId });
    }

    // Get new total across all valid sessions
    const activeUsers = await ActiveUsers.aggregate([
      {
        $match: {
          lastUpdated: { 
            $gte: new Date(Date.now() - 5 * 60 * 1000) 
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$count' }
        }
      }
    ]);
    
    const total = activeUsers[0]?.total || 0;
    return NextResponse.json({ 
      total,
      timestamp: new Date().toISOString(),
      sessionId
    });
  } catch (error) {
    console.error('Error updating active users:', error);
    return NextResponse.json(
      { error: 'Failed to update active users' },
      { status: 500 }
    );
  }
}

// DELETE to handle session cleanup
export async function DELETE(request: Request) {
  try {
    const { roomId, sessionId } = await request.json();
    
    if (!roomId || !sessionId) {
      return NextResponse.json(
        { error: 'Invalid request body. Required: roomId, sessionId' },
        { status: 400 }
      );
    }

    await connectDB();

    // Remove the specific session
    await ActiveUsers.deleteOne({ roomId, sessionId });

    // Clean up any other stale sessions
    await cleanupStaleSessions();

    // Get updated total
    const activeUsers = await ActiveUsers.aggregate([
      {
        $match: {
          lastUpdated: { 
            $gte: new Date(Date.now() - 5 * 60 * 1000) 
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$count' }
        }
      }
    ]);
    
    const total = activeUsers[0]?.total || 0;
    return NextResponse.json({ 
      total,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error cleaning up session:', error);
    return NextResponse.json(
      { error: 'Failed to clean up session' },
      { status: 500 }
    );
  }
} 