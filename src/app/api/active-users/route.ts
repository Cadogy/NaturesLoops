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
        $group: {
          _id: null,
          total: { $sum: '$count' }
        }
      }
    ]);
    
    const total = activeUsers[0]?.total || 0;
    return NextResponse.json({ total });
  } catch (error) {
    console.error('Error fetching active users:', error);
    return NextResponse.json({ error: 'Failed to fetch active users' }, { status: 500 });
  }
}

// POST to update room count
export async function POST(request: Request) {
  try {
    const { roomId, increment } = await request.json();
    
    if (!roomId || typeof increment !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    await connectDB();

    // Update or create the room count
    const result = await ActiveUsers.findOneAndUpdate(
      { roomId },
      {
        $inc: { count: increment },
        $set: { lastUpdated: new Date() }
      },
      {
        new: true,
        upsert: true
      }
    );

    // If count is 0 or negative, remove the record
    if (result.count <= 0) {
      await ActiveUsers.deleteOne({ roomId });
    }

    // Get new total
    const activeUsers = await ActiveUsers.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$count' }
        }
      }
    ]);
    
    const total = activeUsers[0]?.total || 0;
    return NextResponse.json({ total });
  } catch (error) {
    console.error('Error updating active users:', error);
    return NextResponse.json(
      { error: 'Failed to update active users' },
      { status: 500 }
    );
  }
} 