interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutDialog({ isOpen, onClose }: AboutDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/10 scroll-smooth scroll-snap-y">
        {/* Sticky Header */}
        <div className="flex justify-between items-start mb-6 sticky top-0 bg-black/80 backdrop-blur-sm py-2 px-4 z-10">
          <h2 className="text-lg sm:text-xl font-mono text-white">About Nature&apos;s Loops</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-2xl leading-none"
          >
            <span className="sr-only">Close</span>×
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6 font-mono">
          {/* Introduction */}
          <div className="text-white/80 space-y-2">
            <p className="text-sm sm:text-base">
              <span className="text-green-400">$</span> Welcome to Nature&apos;s Loops
            </p>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              A curated collection of lo-fi music channels inspired by nature&apos;s beauty.
              Perfect for studying, working, or just relaxing. Experience the harmony of nature
              and music in a unique retro TV interface.
            </p>
          </div>

          {/* Team Section */}
          <div className="text-white/80 space-y-3">
            <p className="text-sm sm:text-base">
              <span className="text-green-400">$</span> team
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {[
                {
                  name: 'Charles Knapp',
                  role: 'Lead Developer',
                  description: 'Technical director & audio engineer',
                  img: 'https://github.com/charlesknapp.png',
                },
                {
                  name: 'Dylan Safra',
                  role: 'Developer',
                  description: 'Creative director & audio engineer',
                  img: 'https://github.com/interborn.png',
                },
                {
                  name: 'Alex Barthel',
                  role: 'Developer',
                  description: 'Media director & audio engineer',
                  img: 'https://github.com/allizine.png',
                },
              ].map((member) => (
                <div
                  key={member.name}
                  className="flex items-center gap-4 bg-white/5 p-4 rounded-lg"
                >
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                  />
                  <div>
                    <p className="text-sm sm:text-base">{member.name}</p>
                    <p className="text-xs sm:text-sm text-white/40">{member.role}</p>
                    <p className="text-xs text-white/30 mt-1">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          {/* <div className="text-white/80 space-y-3">
            <p className="text-sm sm:text-base">
              <span className="text-green-400">$</span> cat features.txt
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-white/60 space-y-2 ml-4">
              <li>Curated lo-fi music channels</li>
              <li>Retro TV interface with CRT effects</li>
              <li>Channel switching experience</li>
              <li>Keyboard shortcuts for playback control</li>
            </ul>
          </div> */}

          {/* Version Info */}
          <div className="text-white/80 space-y-3">
            <p className="text-sm sm:text-base">
              <span className="text-green-400">$</span> version
            </p>
            <p className="text-xs sm:text-sm text-white/60">Version 1.0.0 - Released 2025</p>
          </div>

          {/* Footer Section */}
          <div className="text-white/80 space-y-3">
            <p className="text-sm sm:text-base">
              <span className="text-green-400">$</span> Made with ❤️ in the USA&quot;
            </p>
            <p className="text-xs sm:text-sm text-white/40 mt-2">
              © 2025 Nature&apos;s Loops. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}