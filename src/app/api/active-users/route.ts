import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ActiveUsers } from '@/models/ActiveUsers';

export const dynamic = 'force-dynamic';

// GET total active users
export async function GET() {
  try {
    await connectDB();
    
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
    
    // Get headers from the request object
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || 'unknown';
    
    if (!roomId || typeof increment !== 'number' || !sessionId) {
      return NextResponse.json(
        { error: 'Invalid request body. Required: roomId, increment, sessionId' },
        { status: 400 }
      );
    }

    await connectDB();

    // For new sessions or heartbeats
    if (increment >= 0) {
      const result = await ActiveUsers.findOneAndUpdate(
        { roomId, sessionId },
        {
          $set: { 
            lastUpdated: new Date(),
            userAgent,
            ipAddress: ip
          },
          $setOnInsert: { count: increment || 1 }
        },
        {
          new: true,
          upsert: true
        }
      );

      // Verify the update was successful
      if (!result) {
        throw new Error('Failed to update session');
      }

      console.log(`Session ${sessionId} updated: count=${result.count}`);
    } else {
      // For decrements, ensure we don't go below 0
      const session = await ActiveUsers.findOne({ roomId, sessionId });
      if (session) {
        const newCount = Math.max(0, session.count + increment);
        if (newCount === 0) {
          await ActiveUsers.deleteOne({ roomId, sessionId });
          console.log(`Session ${sessionId} removed due to zero count`);
        } else {
          await ActiveUsers.updateOne(
            { roomId, sessionId },
            {
              $set: { 
                count: newCount,
                lastUpdated: new Date(),
                userAgent,
                ipAddress: ip
              }
            }
          );
          console.log(`Session ${sessionId} decremented: count=${newCount}`);
        }
      }
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
    const result = await ActiveUsers.deleteOne({ roomId, sessionId });
    if (result.deletedCount > 0) {
      console.log(`Deleted session: ${sessionId} from room: ${roomId}`);
    }

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