"use client";

import { Youtube, Music, Radio, Instagram } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f7f9fc] via-[#e8f3ff] to-[#f5f3ff]" />

      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-black/20" />
      <img
        src="/images/background.jpg"
        alt="Serene nature background"
        className="object-cover mix-blend-soft-light absolute top-0 left-0 w-full h-full"
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 min-h-screen flex flex-col items-center justify-center">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 p-8 rounded-2xl bg-white/0">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 text-white tracking-tight">
            Nature&apos;s <br />Loops
          </h1>
          <p className="text-base md:text-xl text-white/90 italic mb-16 font-medium tracking-wide">
            Your favorite music, you&apos;ve never heard before.
          </p>
          
          {/* Action Buttons */}
          <div className="flex gap-6 justify-center">
            <button className="px-8 py-3 text-gray-800 rounded-full text-sm shadow-md hover:shadow-xl font-medium transition-all duration-300 hover:bg-gray-50">
              Contact
            </button>
            <button className="px-8 py-3 text-gray-800 rounded-full text-sm shadow-md hover:shadow-xl font-medium transition-all duration-300 hover:bg-gray-50">
              Demos
            </button>
          </div>
        </div>

        {/* Social Links */}
        <div className="px-8 py-6 rounded-full bg-white/0">
          <div className="grid grid-cols-2 md:flex md:flex-row items-center justify-center gap-8 md:gap-12">
            {[
              { icon: Instagram, text: "Instagram", href: "https://instagram.com/NaturesLoops", color: "group-hover:text-pink-500" },
              { icon: Youtube, text: "YouTube", href: "https://youtube.com/@NaturesLoops", color: "group-hover:text-red-500" },
              // { icon: Music, text: "Spotify", href: "https://open.spotify.com/artist/natures-loops", color: "group-hover:text-green-500" },
              // { icon: Radio, text: "Apple Music", href: "https://music.apple.com/us/artist/natures-loops/", color: "group-hover:text-purple-500" }
            ].map((item) => (
              <Link 
                key={item.text} 
                href={item.href} 
                className="group flex flex-col items-center gap-2 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  <item.icon className={`w-5 h-5 transition-colors duration-300 ${item.color}`} />
                </div>
                <span className={`text-xs font-medium text-white drop-shadow-md ${item.color} text-center`}>
                  {item.text}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}