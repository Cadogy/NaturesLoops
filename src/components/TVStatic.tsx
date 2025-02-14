'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TVStaticProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

const staticGifs = Array.from({ length: 8 }, (_, i) => `/images/static/static${i + 1}.gif`);

// Create and configure static sound
const staticSound = new Audio('/sounds/static.mp3');
staticSound.preload = 'auto';
staticSound.volume = 0.5; // Set volume to 50%

export function TVStatic({ isVisible, onAnimationComplete }: TVStaticProps) {
  const [selectedGif, setSelectedGif] = useState('');

  const playRandomStaticSegment = useCallback(() => {
    // Reset the sound
    staticSound.pause();
    staticSound.currentTime = 0;

    // Play from the beginning
    const playPromise = staticSound.play();
    if (playPromise) {
      playPromise.catch(err => console.error('Error playing static sound:', err));
    }

    // Stop after 0.5 seconds
    setTimeout(() => {
      staticSound.pause();
      staticSound.currentTime = 0;
    }, 500);
  }, []);

  useEffect(() => {
    if (isVisible) {
      // Select a random static gif
      const randomGif = staticGifs[Math.floor(Math.random() * staticGifs.length)];
      setSelectedGif(randomGif);
      
      // Try to play sound
      playRandomStaticSegment();
    }

    // Cleanup
    return () => {
      staticSound.pause();
      staticSound.currentTime = 0;
    };
  }, [isVisible, playRandomStaticSegment]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onAnimationComplete={onAnimationComplete}
          className={`
            fixed inset-0 
            pointer-events-none 
            z-[40]
            ${isVisible ? 'opacity-100' : 'opacity-0'} 
            transition-opacity duration-300
          `}
        >
          <img
            src={selectedGif}
            alt="TV Static"
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
} 