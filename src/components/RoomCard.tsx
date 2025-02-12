import Image from 'next/image';
import { Play, Users } from 'lucide-react';
import type { Room } from '../utils/roomsData';
import { useState, useEffect } from 'react';

interface RoomCardProps {
  room: Room;
  isActive?: boolean;
  onPlay?: () => void;
}

const RoomCard = ({ room, isActive = false, onPlay }: RoomCardProps) => {
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    // Generate a stable random number on the client side only
    setUserCount(50 + Math.floor(Math.random() * 100));
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPlay?.();
    }
  };

  return (
    <div 
      className={`
        relative group rounded-xl overflow-hidden transition-all duration-300
        ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-105'}
        bg-white dark:bg-gray-800 shadow-lg
      `}
    >
      <div className="relative aspect-video">
        <Image
          src={room.image}
          alt={room.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
        
        <button
          onClick={onPlay}
          onKeyDown={handleKeyDown}
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            p-4 rounded-full bg-white/10 backdrop-blur-sm
            hover:bg-white/20 transition-all duration-300
            ${isActive ? 'scale-110' : 'scale-90 group-hover:scale-100'}
          `}
          aria-label={`Play ${room.name}`}
        >
          <Play className="w-6 h-6 text-white" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-lg font-bold mb-1">{room.name}</h3>
          <p className="text-sm text-gray-200 line-clamp-2">{room.description}</p>
        </div>

        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${room.color} bg-opacity-90`}>
            {room.category}
          </span>
          {userCount !== null && (
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
              <Users className="w-3 h-3" />
              <span>{userCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
