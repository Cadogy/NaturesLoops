interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutDialog({ isOpen, onClose }: AboutDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="flex justify-between items-start mb-6 sticky top-0 bg-black/80 backdrop-blur-sm py-2 z-10">
          <h2 className="text-xl sm:text-2xl font-mono text-white">About Nature&apos;s Loops</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-2xl leading-none"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>
        
        <div className="space-y-8 font-mono">
          <div className="text-white/80 space-y-3">
            <p className="text-sm sm:text-base">
              <span className="text-green-400">$</span> echo &quot;Welcome to Nature&apos;s Loops&quot;
            </p>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              A curated collection of lofi music channels inspired by nature&apos;s beauty.
              Perfect for studying, working, or just relaxing. Experience the harmony of nature
              and music in a unique retro TV interface.
            </p>
          </div>

          <div className="text-white/80 space-y-3">
            <p className="text-sm sm:text-base">
              <span className="text-green-400">$</span> cat team.json
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-lg">
                <img
                  src="https://github.com/charlesknapp.png"
                  alt="Charles"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                />
                <div>
                  <p className="text-sm sm:text-base">Charles Knapp</p>
                  <p className="text-xs sm:text-sm text-white/40">Lead Developer</p>
                  <p className="text-xs text-white/30 mt-1">Technical director & audio engineer</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-lg">
                <img
                  src="https://github.com/interborn.png"
                  alt="Dylan"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                />
                <div>
                  <p className="text-sm sm:text-base">Dylan Safra</p>
                  <p className="text-xs sm:text-sm text-white/40">Developer</p>
                  <p className="text-xs text-white/30 mt-1">Creative director & audio engineer</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-lg">
                <img
                  src="https://github.com/allizine.png"
                  alt="Alex"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                />
                <div>
                  <p className="text-sm sm:text-base">Alex Barthel</p>
                  <p className="text-xs sm:text-sm text-white/40">Developer</p>
                  <p className="text-xs text-white/30 mt-1">Media diretor & audio engineer</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-white/80 space-y-3">
            <p className="text-sm sm:text-base">
              <span className="text-green-400">$</span> cat features.txt
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-white/60 space-y-2 ml-4">
              <li>Curated lofi music channels</li>
              <li>Retro TV interface with CRT effects</li>
              <li>Channel switching experience</li>
              <li>Keyboard shortcuts for playback control</li>
            </ul>
          </div>

          <div className="text-white/80 space-y-3">
            <p className="text-sm sm:text-base">
              <span className="text-green-400">$</span> cat version.txt
            </p>
            <p className="text-xs sm:text-sm text-white/60">
              Version 1.0.0 - Released 2025
            </p>
          </div>

          <div className="text-white/80 space-y-3">
            <p className="text-sm sm:text-base">
              <span className="text-green-400">$</span> echo &quot;Made with ❤️ in the USA&quot;
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