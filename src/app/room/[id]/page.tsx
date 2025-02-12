import type { Metadata } from 'next';
import { getRooms, type Room } from '../../../utils/roomsData';
import RoomClient from './room-client';
import { redirect } from 'next/navigation';

interface Props {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const rooms = await getRooms();
  const room = rooms.find((r: Room) => r.id === params.id);

  if (!room) {
    return {
      title: 'Room Not Found',
      description: 'The requested room could not be found.',
    };
  }

  return {
    title: room.name,
    description: `Experience ${room.name} - ${room.category} on Nature's Loops. A unique lofi music channel inspired by nature.`,
    openGraph: {
      title: `${room.name} - Nature's Loops`,
      description: `Experience ${room.name} - ${room.category} on Nature's Loops. A unique lofi music channel inspired by nature.`,
      images: [
        {
          url: room.image,
          width: 1200,
          height: 630,
          alt: room.name,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${room.name} - Nature's Loops`,
      description: `Experience ${room.name} - ${room.category} on Nature's Loops. A unique lofi music channel inspired by nature.`,
      images: [room.image],
    },
  };
}

export default async function RoomPage({ params }: Props) {
  const rooms = await getRooms();
  
  // If no rooms are initialized yet, redirect to home page
  if (!rooms || rooms.length === 0) {
    redirect('/');
  }

  const room = rooms.find((r: Room) => r.id === params.id);

  if (!room) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error</p>
          <p className="text-white">Room not found</p>
        </div>
      </div>
    );
  }

  return <RoomClient initialRoom={room} allRooms={rooms} />;
} 